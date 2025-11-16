import React, { useState, useCallback } from 'react';
import { useInventory } from './context';
import { Component, View, ProjectSuggestion, Location as LocationType } from './types';
import { identifyComponent, getProjectIdeas } from './services';
import { Button, SecondaryButton, ScanIcon, InventoryIcon, ProjectsIcon, LocationIcon, Modal, ComponentCard, ProjectCard, SearchIcon, ComponentDetailModal, AddComponentModal } from './components';

// --- VIEWS ---

const IdentifyView: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addComponent, addInventoryItem, locations } = useInventory();
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]?.id || '');

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

    try {
      const componentData = await identifyComponent(imageFile, manualInput);
      const newComponent: Component = {
        ...componentData,
        id: `comp-${Date.now()}`,
        imageUrl: preview || undefined
      };
      setResult(newComponent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToInventory = () => {
    if (result) {
      addComponent(result);
      addInventoryItem({
        componentId: result.id,
        quantity: Number(quantity),
        locationId: selectedLocation,
      });
      setIsModalOpen(false);
      setResult(null);
      setPreview(null);
      setImageFile(null);
      setManualInput('');
    }
  };

  const reset = () => {
    setImageFile(null);
    setPreview(null);
    setManualInput('');
    setError(null);
    setResult(null);
    setIsLoading(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-teal-400">Identify Component</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300">Upload Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {preview ? (
                  <img src={preview} alt="Component preview" className="mx-auto h-48 w-auto object-contain" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-500">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-teal-400 hover:text-teal-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-teal-500 px-2">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label htmlFor="manual-input" className="block text-sm font-medium text-gray-300">Or Enter Details Manually</label>
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
      
      {isLoading && <div className="text-center p-4"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div><p className="mt-2">Workshop AI is thinking...</p></div>}
      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

      {result && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bold text-teal-400 mb-4">Identification Result</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {result.imageUrl && <img src={result.imageUrl} alt={result.name} className="w-full md:w-48 h-48 object-cover rounded-lg" />}
            <div className="flex-1">
              <h3 className="text-xl font-bold">{result.name}</h3>
              <p className="text-md text-gray-400 mb-2">{result.category}</p>
              <p className="text-gray-300 mb-4">{result.description}</p>
              <h4 className="font-semibold text-gray-200">Specifications:</h4>
              <ul className="list-disc list-inside text-gray-400 mb-4">
                {Object.entries(result.specs).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}
              </ul>
              <div className="flex flex-wrap gap-2">
                {result.tags.map(tag => <span key={tag} className="bg-gray-700 text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
              </div>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>Add to Inventory</Button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Inventory">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{result?.name}</h3>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input-style mt-1 py-2 px-3" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
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
  const { getInventoryWithDetails, findComponentById } = useInventory();
  const allInventory = getInventoryWithDetails();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);

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
        <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <InventoryIcon />
            <h2 className="mt-4 text-xl font-semibold text-gray-300">Your Workshop is Tidy!</h2>
            <p className="mt-1">Your inventory is empty. Use the 'Identify' tab or manually add a component to get started.</p>
            <Button className="mt-6" onClick={() => setIsAddComponentModalOpen(true)}>Add First Component</Button>
            <AddComponentModal isOpen={isAddComponentModalOpen} onClose={() => setIsAddComponentModalOpen(false)} />
        </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-teal-400">Inventory</h1>
        <div className="flex items-center gap-4">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
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
          <div className="text-center py-10 text-gray-500 col-span-full">
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

const ProjectsView: React.FC = () => {
    const { getInventoryWithDetails } = useInventory();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<ProjectSuggestion[]>([]);

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
                <h1 className="text-3xl font-bold text-teal-400">Project Ideas</h1>
                <Button onClick={handleGenerateProjects} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Suggest Projects From My Inventory'}
                </Button>
            </div>
            {isLoading && <div className="text-center p-4"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div><p className="mt-2">Finding cool projects for you...</p></div>}
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}
            
            {projects.length > 0 && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((proj, index) => <ProjectCard key={index} project={proj} />)}
                </div>
            )}

            {projects.length === 0 && !isLoading && !error && (
                <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
                    <ProjectsIcon />
                    <h2 className="mt-2 text-xl font-semibold">Ready to build something?</h2>
                    <p className="mt-1 text-gray-400">Click the button to get project ideas based on your current inventory.</p>
                </div>
            )}
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
            <h1 className="text-3xl font-bold text-teal-400">Storage Locations</h1>
            
            <form onSubmit={handleAddLocation} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-bold text-gray-200">Add New Location</h2>
                <div>
                    <label htmlFor="loc-name" className="block text-sm font-medium text-gray-300">Location Name</label>
                    <input type="text" id="loc-name" value={name} onChange={e => setName(e.target.value)} className="input-style mt-1 py-2 px-3" placeholder="e.g., Small Parts Box" required/>
                </div>
                <div>
                    <label htmlFor="loc-desc" className="block text-sm font-medium text-gray-300">Description</label>
                    <input type="text" id="loc-desc" value={description} onChange={e => setDescription(e.target.value)} className="input-style mt-1 py-2 px-3" placeholder="e.g., On the second shelf" required/>
                </div>
                <Button type="submit">Add Location</Button>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-200">Existing Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map(loc => (
                        <div key={loc.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-teal-400">{loc.name}</h3>
                            <p className="text-sm text-gray-400">{loc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- APP ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.INVENTORY);

  const renderView = () => {
    switch (currentView) {
      case View.IDENTIFY:
        return <IdentifyView />;
      case View.INVENTORY:
        return <InventoryView />;
      case View.PROJECTS:
        return <ProjectsView />;
      case View.LOCATIONS:
        return <LocationsView />;
      default:
        return <InventoryView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-gray-100 font-sans">
      <style>{`
        .input-style { background-color: #1F2937; border: 1px solid #4B5563; color: #F3F4F6; border-radius: 0.5rem; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; }
        .input-style:focus { border-color: #2DD4BF; box-shadow: 0 0 0 2px rgba(45, 212, 191, 0.5); outline: none; }
        .label-style { display: block; text-sm; font-medium; color: #D1D5DB; margin-bottom: 0.25rem; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 pb-16 md:pb-0">
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
  { view: View.IDENTIFY, icon: <ScanIcon />, label: 'Identify' },
  { view: View.INVENTORY, icon: <InventoryIcon />, label: 'Inventory' },
  { view: View.PROJECTS, icon: <ProjectsIcon />, label: 'Projects' },
  { view: View.LOCATIONS, icon: <LocationIcon />, label: 'Locations' },
];

const NavItem: React.FC<{ item: typeof navItems[0]; isActive: boolean; onClick: () => void; isSidebar: boolean; }> = ({ item, isActive, onClick, isSidebar }) => {
  const activeClass = 'bg-gray-800 text-teal-400';
  const inactiveClass = 'text-gray-400 hover:bg-gray-700 hover:text-white';
  const baseClass = isSidebar ? 'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors' : 'flex flex-col items-center justify-center p-2 rounded-lg';
  return (
    <button onClick={onClick} className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}>
      {item.icon}
      <span className={isSidebar ? 'text-sm font-medium' : 'text-xs mt-1'}>{item.label}</span>
    </button>
  );
};

const Sidebar: React.FC<NavProps> = ({ currentView, setCurrentView }) => (
  <aside className="hidden md:flex flex-col w-64 bg-gray-800/50 border-r border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-8">
      <svg className="w-8 h-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5m-15 3.75h1.5m15 0h1.5M12 6.75h.008v.008H12V6.75zM12 12h.008v.008H12V12zm0 5.25h.008v.008H12v-.008z" /></svg>
      <h1 className="text-xl font-bold">Workshop AI</h1>
    </div>
    <nav className="flex-1 space-y-2">
      {navItems.map(item => <NavItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => setCurrentView(item.view)} isSidebar={true} />)}
    </nav>
  </aside>
);

const BottomNav: React.FC<NavProps> = ({ currentView, setCurrentView }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around p-1 z-10">
    {navItems.map(item => <NavItem key={item.view} item={item} isActive={currentView === item.view} onClick={() => setCurrentView(item.view)} isSidebar={false} />)}
  </nav>
);

export default App;