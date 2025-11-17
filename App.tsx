import React, { useState, useCallback, useEffect } from 'react';
import { useInventory } from './context';
import { useAuth } from './auth';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Component, View, ProjectSuggestion, Location as LocationType } from './types';
import { identifyComponent, getProjectIdeas, askAboutComponent } from './services';
import { Button, SecondaryButton, CameraIcon, InventoryIcon, LightbulbIcon, LocationIcon, Modal, ComponentCard, ProjectCard, SearchIcon, ComponentDetailModal, AddComponentModal, ClipboardListIcon, AddProjectModal, ProjectManagementCard, ProjectDetailModal, SettingsIcon } from './components';

// --- ICONS ---
const SignOutIcon = () => <svg className="w-6 h-6" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;
const WorkshopIcon = () => <svg className="w-8 h-8 text-teal-500 dark:text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-15 3.75h1.5m15 0h1.5M12 6.75h.008v.008H12V6.75zM12 12h.008v.008H12V12zm0 5.25h.008v.008H12v-.008z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3.75 12H6m4.95-7.757l-1.59 1.59M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;

// --- THEME ---
type Theme = 'light' | 'dark';

// --- VIEWS ---

// (All original views: IdentifyView, InventoryView, etc. remain here without changes)
const IdentifyView: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [identificationHistory, setIdentificationHistory] = useState<Component[]>([]);

  const { addComponent, addInventoryItem, locations } = useInventory();
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]?.id || '');

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ws_identification_history');
      if (savedHistory) {
        setIdentificationHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load identification history:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ws_identification_history', JSON.stringify(identificationHistory));
  }, [identificationHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleIdentify = async () => {
    if (!imageFile && !manualInput) {
      setError('Please provide an image or a description.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setChatHistory([]);

    try {
      const componentData = await identifyComponent(imageFile, manualInput);
      const newComponent: Component = {
        ...componentData,
        id: `comp-${Date.now()}`,
        imageUrl: preview || undefined
      };
      setResult(newComponent);
      setIdentificationHistory(prev => {
        const newHistory = [newComponent, ...prev.filter(c => c.id !== newComponent.id)];
        return newHistory.slice(0, 5); // Keep the 5 most recent
      });
      setChatHistory([{ role: 'model', text: `I've identified this as a ${newComponent.name}. What would you like to know about it?` }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAskQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userQuestion.trim() || !result) return;
      
      const question = userQuestion.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: question }]);
      setUserQuestion('');
      setIsAnswering(true);

      try {
          const answer = await askAboutComponent(result, question);
          setChatHistory(prev => [...prev, { role: 'model', text: answer }]);
      } catch (err) {
          setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I ran into an error trying to answer that. Please try again." }]);
      } finally {
          setIsAnswering(false);
      }
  };

  const reset = () => {
    setImageFile(null);
    setPreview(null);
    setManualInput('');
    setError(null);
    setResult(null);
    setIsLoading(false);
    setChatHistory([]);
  }

  const handleAddToInventory = () => {
    if (result) {
      addComponent(result);
      addInventoryItem({
        componentId: result.id,
        quantity: Number(quantity),
        locationId: selectedLocation,
      });
      setIsModalOpen(false);
      reset();
    }
  };

  const handleHistoryClick = (component: Component) => {
    setResult(component);
    setError(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">Identify Component</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Upload Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {preview ? (
                  <img src={preview} alt="Component preview" className="mx-auto h-48 w-auto object-contain" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-500 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-md font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-50 dark:focus-within:ring-offset-gray-800 focus-within:ring-teal-500 px-2">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label htmlFor="manual-input" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Or Enter Details Manually</label>
            <textarea id="manual-input" rows={4} className="input-style py-2 px-3" placeholder="e.g., 'Blue resistor with bands brown, black, orange, gold'" value={manualInput} onChange={(e) => setManualInput(e.target.value)}></textarea>
             <div className="flex gap-4">
                <Button onClick={handleIdentify} disabled={isLoading || (!imageFile && !manualInput)}>
                    {isLoading ? 'Identifying...' : 'Identify'}
                </Button>
                <SecondaryButton onClick={reset}>Reset</SecondaryButton>
             </div>
          </div>
        </div>
      </div>
      
      {identificationHistory.length > 0 && !result && !isLoading && !error && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-6 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">Recently Identified</h2>
          <div className="space-y-3">
            {identificationHistory.map(component => (
              <button 
                key={component.id} 
                onClick={() => handleHistoryClick(component)}
                className="w-full flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {component.imageUrl ? (
                  <img src={component.imageUrl} alt={component.name} className="w-12 h-12 object-cover rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <CameraIcon />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{component.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{component.simpleName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && <div className="text-center p-4"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 dark:border-teal-400 mx-auto"></div><p className="mt-2 text-gray-600 dark:text-gray-300">Workshop AI is thinking...</p></div>}
      {error && <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">{error}</div>}

      {result && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bold text-teal-500 dark:text-teal-400 mb-4">Identification Result</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {result.imageUrl && <img src={result.imageUrl} alt={result.name} className="w-full md:w-48 h-48 object-cover rounded-lg bg-gray-200 dark:bg-gray-700" />}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.name}</h3>
                <p className="text-lg text-teal-600 dark:text-teal-300 -mt-1">{result.simpleName}</p>
                <p className="text-md text-gray-500 dark:text-gray-400">{result.category}</p>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{result.description}</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map(tag => <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-teal-700 dark:text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Typical Applications</h4>
              <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 space-y-1">
                  {(result.typicalUses || []).map((use, i) => <li key={i}>{use}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Specifications</h4>
              <div className="space-y-1 text-gray-500 dark:text-gray-400 max-h-40 overflow-y-auto">
                  {Object.entries(result.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm pr-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">{key}:</span>
                          <span className="text-right truncate">{value}</span>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={() => setIsModalOpen(true)}>Add to Inventory</Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Ask About This Component</h3>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto flex flex-col gap-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAnswering && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleAskQuestion} className="mt-4 flex gap-2">
              <input 
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="e.g., How do I power this?"
                className="input-style flex-1"
                disabled={isAnswering}
              />
              <Button type="submit" disabled={isAnswering || !userQuestion.trim()}>
                {isAnswering ? '...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Inventory">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{result?.name}</h3>
          <div>
            <label htmlFor="quantity" className="label-style">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input-style mt-1 py-2 px-3" />
          </div>
          <div>
            <label htmlFor="location" className="label-style">Location</label>
            <select id="location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="input-style mt-1 py-2 px-3">
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
            <Button onClick={handleAddToInventory}>Add Item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
const InventoryView: React.FC = () => {
  const { getInventoryWithDetails, findComponentById, loading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 dark:border-teal-400"></div></div>;
  }
  
  const allInventory = getInventoryWithDetails();

  const filteredInventory = allInventory.filter(item => {
    const query = searchQuery.toLowerCase();
    const component = item.component;
    return (
      component.name.toLowerCase().includes(query) ||
      component.category.toLowerCase().includes(query) ||
      component.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  const selectedComponent = selectedComponentId ? findComponentById(selectedComponentId) : null;

  if (allInventory.length === 0) {
    return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-500 flex flex-col items-center justify-center h-full">
            <InventoryIcon />
            <h2 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-300">Your Workshop is Tidy!</h2>
            <p className="mt-1">Your inventory is empty. Use the 'Identify' tab or manually add a component to get started.</p>
            <Button className="mt-6" onClick={() => setIsAddComponentModalOpen(true)}>Add First Component</Button>
            <AddComponentModal isOpen={isAddComponentModalOpen} onClose={() => setIsAddComponentModalOpen(false)} />
        </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">Inventory</h1>
        <div className="flex items-center gap-4">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <SearchIcon />
                </span>
                <input 
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-style pl-10 pr-3 py-2 w-full sm:w-64"
                />
            </div>
            <Button onClick={() => setIsAddComponentModalOpen(true)}>Add Component</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map(item => (
          <ComponentCard 
            key={`${item.componentId}-${item.locationId}`} 
            component={item.component} 
            quantity={item.quantity} 
            location={item.location}
            onClick={() => setSelectedComponentId(item.componentId)}
          />
        ))}
      </div>
      
      {filteredInventory.length === 0 && searchQuery && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 col-span-full">
              <p>No components found for "{searchQuery}".</p>
          </div>
      )}

      <ComponentDetailModal 
        component={selectedComponent}
        isOpen={!!selectedComponentId}
        onClose={() => setSelectedComponentId(null)}
      />
       <AddComponentModal isOpen={isAddComponentModalOpen} onClose={() => setIsAddComponentModalOpen(false)} />
    </div>
  );
};
const ProjectIdeasView: React.FC = () => {
    const { getInventoryWithDetails } = useInventory();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<ProjectSuggestion[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectSuggestion | null>(null);

    const handleGenerateProjects = async () => {
        setIsLoading(true);
        setError(null);
        setProjects([]);
        const inventory = getInventoryWithDetails();
        if (inventory.length === 0) {
            setError("Your inventory is empty. Add some components to get project ideas.");
            setIsLoading(false);
            return;
        }
        try {
            const ideas = await getProjectIdeas(inventory);
            setProjects(ideas);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
  
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">Project Ideas</h1>
                <Button onClick={handleGenerateProjects} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Suggest Projects From My Inventory'}
                </Button>
            </div>
            {isLoading && <div className="text-center p-4"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 dark:border-teal-400 mx-auto"></div><p className="mt-2 text-gray-600 dark:text-gray-300">Finding cool projects for you...</p></div>}
            {error && <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">{error}</div>}
            
            {projects.length > 0 && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((proj, index) => <ProjectCard key={index} project={proj} onClick={() => setSelectedProject(proj)} />)}
                </div>
            )}

            {projects.length === 0 && !isLoading && !error && (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg">
                    <LightbulbIcon />
                    <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Ready to build something?</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Click the button to get project ideas based on your current inventory.</p>
                </div>
            )}
             <ProjectDetailModal 
                isOpen={!!selectedProject} 
                onClose={() => setSelectedProject(null)} 
                project={selectedProject} 
            />
        </div>
    );
};
const MyProjectsView: React.FC = () => {
    const { projects } = useInventory();
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">My Projects</h1>
                <Button onClick={() => setIsAddProjectModalOpen(true)}>Create New Project</Button>
            </div>

            {projects.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((proj) => <ProjectManagementCard key={proj.id} project={proj} />)}
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg">
                    <ClipboardListIcon />
                    <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No projects yet.</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Click the button to create your first project and track its components.</p>
                </div>
            )}
            
            <AddProjectModal isOpen={isAddProjectModalOpen} onClose={() => setIsAddProjectModalOpen(false)} />
        </div>
    );
};
const LocationsView: React.FC = () => {
    const { locations, addLocation } = useInventory();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleAddLocation = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description) {
            addLocation({ name, description });
            setName('');
            setDescription('');
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">Storage Locations</h1>
            
            <form onSubmit={handleAddLocation} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">Add New Location</h2>
                <div>
                    <label htmlFor="loc-name" className="label-style">Location Name</label>
                    <input type="text" id="loc-name" value={name} onChange={e => setName(e.target.value)} className="input-style mt-1 py-2 px-3" placeholder="e.g., Small Parts Box" required/>
                </div>
                <div>
                    <label htmlFor="loc-desc" className="label-style">Description</label>
                    <input type="text" id="loc-desc" value={description} onChange={e => setDescription(e.target.value)} className="input-style mt-1 py-2 px-3" placeholder="e.g., On the second shelf" required/>
                </div>
                <Button type="submit">Add Location</Button>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mt-6">Existing Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map(loc => (
                        <div key={loc.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-teal-500 dark:text-teal-400">{loc.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{loc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
const LoginView: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
            <WorkshopIcon />
            <h2 className="mt-4 text-3xl font-bold text-white">Welcome to Workshop AI</h2>
            <p className="mt-2 text-gray-400">{isSignUp ? 'Create an account to get started' : 'Sign in to your workshop'}</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="label-style" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-style py-2 px-3" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-style" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="input-style py-2 px-3" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div>
            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-teal-400 hover:text-teal-300">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
const SettingsView: React.FC<{ theme: Theme, setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => {
    const { currentUser } = useAuth();
    const handleSignOut = () => {
        signOut(auth);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <h1 className="text-3xl font-bold text-teal-500 dark:text-teal-400">Settings</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-8 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Appearance Section */}
                <div className="pt-4 first:pt-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-300 flex flex-col">
                            <span>Theme</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Current: {theme === 'light' ? 'Light' : 'Dark'}</span>
                        </label>
                        <button 
                            onClick={toggleTheme}
                            className="relative inline-flex items-center justify-center h-8 w-14 rounded-full transition-colors bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-teal-500"
                        >
                            <span className="sr-only">Toggle theme</span>
                            <span className={`absolute left-1 transition-transform duration-300 ease-in-out ${theme === 'light' ? 'translate-x-0' : 'translate-x-6'}`}>
                                <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow">
                                  {theme === 'light' ? <SunIcon /> : <MoonIcon />}
                                </span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <div className="pt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Account</h2>
                     <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <p>You are signed in as <strong>{currentUser?.email}</strong></p>
                    </div>
                    <Button onClick={handleSignOut}>
                       <div className="flex items-center gap-2">
                           <SignOutIcon />
                           <span>Sign Out</span>
                       </div>
                    </Button>
                </div>

                 {/* About Section */}
                 <div className="pt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">About</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p><strong>Workshop AI</strong> v1.0.0</p>
                        <p>Your personal assistant for your electronics workshop. It recognizes components, tracks inventory, and suggests projects based on the parts you have.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- APP ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.IDENTIFY);
  const { currentUser } = useAuth();
  const { loading: inventoryLoading } = useInventory();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme | null;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!currentUser) {
    return <LoginView />;
  }
  
  const renderView = () => {
    if (inventoryLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 dark:border-teal-400"></div></div>;
    }
    switch (currentView) {
      case View.IDENTIFY: return <IdentifyView />;
      case View.INVENTORY: return <InventoryView />;
      case View.IDEAS: return <ProjectIdeasView />;
      case View.MY_PROJECTS: return <MyProjectsView />;
      case View.LOCATIONS: return <LocationsView />;
      case View.SETTINGS: return <SettingsView theme={theme} setTheme={setTheme} />;
      default: return <InventoryView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      <style>{`
        .input-style { background-color: #F3F4F6; border: 1px solid #D1D5DB; color: #1F2937; border-radius: 0.5rem; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; }
        .dark .input-style { background-color: #1F2937; border-color: #4B5563; color: #F3F4F6; }
        .input-style:focus { border-color: #2DD4BF; box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.5); outline: none; }
        .label-style { display: block; text-sm; font-medium; color: #374151; margin-bottom: 0.25rem; }
        .dark .label-style { color: #D1D5DB; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

// --- NAVIGATION ---

interface NavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems = [
  { view: View.IDENTIFY, icon: <CameraIcon />, label: 'Identify' },
  { view: View.INVENTORY, icon: <InventoryIcon />, label: 'Inventory' },
  { view: View.IDEAS, icon: <LightbulbIcon />, label: 'Ideas' },
  { view: View.MY_PROJECTS, icon: <ClipboardListIcon />, label: 'My Projects' },
  { view: View.LOCATIONS, icon: <LocationIcon />, label: 'Locations' },
  { view: View.SETTINGS, icon: <SettingsIcon />, label: 'Settings' },
];

const NavItem: React.FC<{ item: typeof navItems[0]; isActive: boolean; onClick: () => void; isSidebar: boolean; }> = ({ item, isActive, onClick, isSidebar }) => {
  const activeClass = 'bg-gray-200 dark:bg-gray-800 text-teal-500 dark:text-teal-400';
  const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white';
  const baseClass = isSidebar ? 'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors' : 'flex flex-col items-center justify-center p-2 rounded-lg';
  return (
    <button onClick={onClick} className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}>
      {item.icon}
      <span className={isSidebar ? 'text-sm font-medium' : 'text-xs mt-1'}>{item.label}</span>
    </button>
  );
};

const Sidebar: React.FC<NavProps> = ({ currentView, setCurrentView }) => {
    const { currentUser } = useAuth();
    
    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-8">
            <WorkshopIcon />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Workshop AI</h1>
            </div>
            <nav className="flex-1 space-y-2">
            {navItems.map(item => <NavItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => setCurrentView(item.view)} isSidebar={true} />)}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 px-3 truncate" title={currentUser?.email || ''}>
                    Logged in as: <strong>{currentUser?.email}</strong>
                </div>
            </div>
        </aside>
    );
};

const BottomNav: React.FC<NavProps> = ({ currentView, setCurrentView }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 z-10">
    {navItems.map(item => <NavItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => setCurrentView(item.view)} isSidebar={false} />)}
  </nav>
);

export default App;