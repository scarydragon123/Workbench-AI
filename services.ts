


import { GoogleGenAI, Type } from "@google/genai";
import { Component, InventoryItem, Location as LocationType } from './types';

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

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
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const userPrompt = `You are Workshop AI, an expert at identifying electronic components with high accuracy.

    **Your Task:**
    Analyze the provided image and/or text to identify the electronic component.

    **Critical Identification Protocol:**
    1.  **Examine Markings First:** Your HIGHEST PRIORITY is to meticulously read any text, numbers, and logos on the component itself. These markings are the key to the correct part number.
    2.  **Verify with Visuals:** Cross-reference the markings with the component's physical characteristics (package type, pin count, color, form factor).
    3.  **Synthesize Information:** Combine the markings and visual data to determine the most accurate part number and details.

    **Output Format:**
    Provide a detailed JSON response. The 'name' field MUST be the specific part number if visible (e.g., 'INMP441', 'ESP32-WROOM-32'), not a generic name.

    - simpleName: A common, easy-to-understand name for this component (e.g., 'MEMS Microphone Module').
    - category: One of: 'MCU', 'Sensor', 'Passive', 'IC', 'Module', 'Connector', 'Mechanical', 'Power', 'Display'.
    - specs: An array of objects, each with 'specName' and 'specValue'.
    - description: A short description of what the component is and does.
    - typicalUses: A list explaining what the component is used for.
    - recommendedCircuits: A list of example circuits.
    - tags: Common use-case tags.

    If you are uncertain, state your low confidence in the description.

    **User-provided input (use as a hint):** "${manualInput}"`;
    
    let contents;
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        contents = { parts: [imagePart, { text: userPrompt }] };
    } else {
        contents = userPrompt;
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            simpleName: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            specs: { 
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        specName: { type: Type.STRING },
                        specValue: { type: Type.STRING }
                    }
                }
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            typicalUses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedCircuits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      }
    });

    try {
        const text = response.text.trim();
        // The response will have specs as an array, so we need to process it.
        const parsedResponse = JSON.parse(text) as { specs: { specName: string; specValue: string }[] } & Omit<Component, 'id' | 'imageUrl' | 'specs'>;
        
        const specsObject = (parsedResponse.specs || []).reduce((acc, spec) => {
            if (spec.specName && spec.specValue) {
               acc[spec.specName] = spec.specValue;
            }
            return acc;
        }, {} as Record<string, string>);

        // Return the component with the specs object correctly formatted.
        return {
            ...parsedResponse,
            specs: specsObject,
        };
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text, e);
        throw new Error("Could not identify the component from the response.");
    }
};

export const askAboutComponent = async (component: Component, question: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    const componentContext = `
        Component Name: ${component.name}
        Simple Name: ${component.simpleName}
        Category: ${component.category}
        Description: ${component.description}
        Specifications: ${JSON.stringify(component.specs)}
        Typical Uses: ${component.typicalUses?.join(', ')}
    `;

    const userPrompt = `You are Workshop AI, an expert in electronic components.
    A user has identified the following component:
    --- COMPONENT CONTEXT ---
    ${componentContext}
    --- END CONTEXT ---

    Now, answer the user's following question about this specific component. Be helpful and concise.

    Question: "${question}"
    `;

    const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
    });

    return response.text;
};

export const getProjectIdeas = async (inventory: (InventoryItem & { component: Component; location: LocationType })[]) => {
    const ai = getAiClient();
    const model = 'gemini-2.5-pro';
    const availableComponents = inventory.map(item => ({ name: item.component.name, quantity: item.quantity }));
    
    const userPrompt = `You are Workshop AI, a creative assistant for electronics hobbyists.
    Given the following list of available components and their quantities, suggest 3 project ideas.
    Your suggestions should be practical and buildable with the given parts, but you can include 1 or 2 minor, common components that are likely to be available (like wires, breadboard, basic resistors) even if not listed.
    For each project, provide a name, a short description, a difficulty rating from 1 (beginner) to 5 (expert), and a list of required components.
    For each required component, indicate if it's available from the provided list.

    Available components: ${JSON.stringify(availableComponents)}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
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