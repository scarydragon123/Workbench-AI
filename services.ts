
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Added Location to the import to resolve type ambiguity with the global Location object.
import { Component, InventoryItem, Location } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function fileToGenerativePart(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject('Failed to read file');
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export const identifyComponent = async (imageFile: File | null, manualInput: string): Promise<Omit<Component, 'id' | 'imageUrl'>> => {
    const model = 'gemini-2.5-flash';
    const parts = [];

    let prompt = `You are Workshop AI, an expert in electronic components. 
    Based on the provided image and/or text, identify the component. 
    Provide a detailed JSON response. The main name should be the specific part number if available (e.g., 'ESP32-WROOM-32'), not a generic name.
    The category should be one of: 'MCU', 'Sensor', 'Passive', 'IC', 'Module', 'Connector', 'Mechanical'.
    Include a short 'description' of what the component is and does.
    Provide common use-case tags.
    If you are unsure, make a best guess and indicate low confidence in the description.
    Manual input: "${manualInput}"`;
    
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        parts.push(imagePart);
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            specs: { 
                type: Type.OBJECT,
                properties: {},
                additionalProperties: { type: Type.STRING }
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      }
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("Could not identify the component from the response.");
    }
};

export const getProjectIdeas = async (inventory: (InventoryItem & { component: Component; location: Location })[]) => {
    const model = 'gemini-2.5-pro';
    const availableComponents = inventory.map(item => ({ name: item.component.name, quantity: item.quantity }));
    
    const prompt = `You are Workshop AI, a creative assistant for electronics hobbyists. 
    Given the following list of available components and their quantities, suggest 3 project ideas.
    Your suggestions should be practical and buildable with the given parts, but you can include 1 or 2 minor, common components that are likely to be available (like wires, breadboard, basic resistors) even if not listed.
    For each project, provide a name, a short description, a difficulty rating from 1 (beginner) to 5 (expert), and a list of required components.
    For each required component, indicate if it's available from the provided list.

    Available components: ${JSON.stringify(availableComponents)}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projects: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                difficulty: { type: Type.NUMBER },
                                components: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            quantity: { type: Type.NUMBER },
                                            available: { type: Type.BOOLEAN }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    try {
        const text = response.text.trim();
        const parsed = JSON.parse(text);
        return parsed.projects;
    } catch (e) {
        console.error("Failed to parse Gemini project response:", response.text);
        throw new Error("Could not generate project ideas from the response.");
    }
};