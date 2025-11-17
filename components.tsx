
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Component, Location as LocationType, ProjectSuggestion, InventoryItem, Project, ProjectComponent } from './types';
import { useInventory } from './context';

// --- Icons ---
const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
};

const smallIconProps = {
    className: "w-4 h-4",
    strokeWidth: 2,
}

export const ScanIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-2.33V4.5A2.25 2.25 0 0016.5 2.25h-9A2.25 2.25 0 005.25 4.5v.73" /></svg>;
export const InventoryIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
export const ProjectsIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.211 1.002l-4.254 5.956a2.25 2.25 0 00.21 3.002l4.254 2.968a2.25 2.25 0 003.002-.21l5.956-4.254a2.25 2.25 0 001.002-.211v-5.714a2.25 2.25 0 00-2.25-2.25H12a2.25 2.25 0 00-2.25 2.25z" /></svg>;
export const LocationIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
export const ClipboardListIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
export const SearchIcon = () => <svg {...smallIconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
export const SettingsIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.052-.022c.563-.23 1.22-.185 1.745.145l.048.031c.49.333.82.893.923 1.517l.024.111a11.043 11.043 0 013.444 2.115l.102.083c.533.437.892 1.13.91 1.834l.002.127a11.103 11.103 0 01-1.04 3.447l-.05.102c-.347.64-.93,1.13-1.64,1.365l-.11.035a11.043 11.043 0 01-2.115 3.444l-.083.102c-.437.533-1.13.892-1.834.91l-.127.002a11.103 11.103 0 01-3.447-1.04l-.102-.05c-.64-.347-1.13-.93-1.365-1.64l-.035-.11a11.043 11.043 0 01-3.444-2.115l-.102-.083c-.533-.437-.892-1.13-.91-1.834l-.002-.127a11.103 11.103 0 011.04-3.447l.05-.102c.347-.64.93-1.13 1.64-1.365l.11-.035a11.043 11.043 0 012.115-3.444l.083-.102c.437-.533 1.13-.892 1.834-.91l.127-.002z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const XIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg {...smallIconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const PlusIcon = () => <svg {...smallIconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`bg-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
    <button
      className={`bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-75 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-teal-400">{title}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Close modal"><XIcon /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Cards ---
interface ComponentCardProps {
    component: Component;
    quantity: number;
    location: LocationType;
    onClick: () => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ component, quantity, location, onClick }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-teal-500 cursor-pointer transition-all group"
        onClick={onClick}
    >
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-teal-400">{component.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{component.category}</p>
        <div className="mt-4 flex justify-between items-end">
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Location</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300">{location.name}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Quantity</p>
                <p className="font-bold text-2xl text-teal-400">{quantity}</p>
            </div>
        </div>
    </div>
);

interface ProjectCardProps {
    project: ProjectSuggestion;
    onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full hover:border-teal-500 cursor-pointer transition-colors"
        onClick={onClick}
    >
        <h3 className="font-bold text-lg text-teal-400">{project.name}</h3>
        <div className="flex items-center gap-2 my-1">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Difficulty:</span>
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < project.difficulty ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                ))}
            </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow">{project.description}</p>
        <div className="mt-4">
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Required Components:</h4>
            <ul className="space-y-1 text-sm">
                {project.components.map((c, i) => (
                    <li key={i} className="flex justify-between items-center">
                        <span className={`truncate ${c.available ? 'text-gray-700 dark:text-gray-300' : 'text-red-500 dark:text-red-400'}`}>
                           {c.quantity}x {c.name}
                        </span>
                        {c.available ? 
                            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Available</span> : 
                            <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">Missing</span>}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

interface ProjectManagementCardProps {
    project: Project;
}
export const ProjectManagementCard: React.FC<ProjectManagementCardProps> = ({ project }) => {
    const { findComponentById, inventory } = useInventory();
    
    const totalRequired = project.components.length;
    const availableCount = project.components.filter(req => {
        const totalAvailable = inventory
            .filter(item => item.componentId === req.componentId)
            .reduce((sum, item) => sum + item.quantity, 0);
        return totalAvailable >= req.quantity;
    }).length;

    const availabilityRatio = totalRequired > 0 ? availableCount / totalRequired : 1;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <h3 className="font-bold text-lg text-teal-400">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow mt-1 mb-4">{project.description}</p>
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Bill of Materials</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{availableCount} of {totalRequired} components available</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${availabilityRatio * 100}%` }}></div>
                </div>
                <ul className="space-y-1 text-sm max-h-32 overflow-y-auto pr-2">
                    {project.components.map((c, i) => {
                         const component = findComponentById(c.componentId);
                         const totalAvailable = inventory
                            .filter(item => item.componentId === c.componentId)
                            .reduce((sum, item) => sum + item.quantity, 0);
                         const isAvailable = totalAvailable >= c.quantity;
                         return (
                            <li key={i} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                <span className="truncate">{c.quantity}x {component?.name || 'Unknown'}</span>
                                <span className={`font-mono text-xs ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {totalAvailable}/{c.quantity}
                                </span>
                            </li>
                         )
                    })}
                </ul>
            </div>
        </div>
    );
};


// --- Modals ---

interface ComponentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    component: Component | null;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({ isOpen, onClose, component }) => {
    const { inventory, updateInventoryItem, deleteComponent, findLocationById, getProjectsForComponent } = useInventory();
    
    if (!component) return null;

    const componentInventory = inventory.filter(i => i.componentId === component.id);
    const projectsUsing = getProjectsForComponent(component.id);

    const handleQuantityChange = (locationId: string, newQuantity: string) => {
        updateInventoryItem(component.id, locationId, Number(newQuantity));
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${component.name}? This will remove it from all locations and cannot be undone.`)) {
            deleteComponent(component.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Component Details" size="xl">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {component.imageUrl && <img src={component.imageUrl} alt={component.name} className="w-full md:w-48 h-48 object-cover rounded-lg bg-gray-200 dark:bg-gray-700" />}
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{component.name}</h3>
                        <p className="text-md text-gray-500 dark:text-gray-400 mb-2">{component.category}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{component.description}</p>
                         <div className="flex flex-wrap gap-2">
                            {component.tags.map(tag => <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-teal-800 dark:text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Specifications</h4>
                        <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 space-y-1">
                            {Object.entries(component.specs).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Typical Uses</h4>
                        <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 space-y-1">
                            {component.typicalUses?.map((use, i) => <li key={i}>{use}</li>)}
                        </ul>
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Inventory Levels</h4>
                    <div className="space-y-2">
                        {componentInventory.map(item => (
                            <div key={item.locationId} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                                <span className="text-gray-700 dark:text-gray-300">{findLocationById(item.locationId)?.name}</span>
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => handleQuantityChange(item.locationId, e.target.value)}
                                    className="input-style w-24 text-center py-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {projectsUsing.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Used In Projects</h4>
                        <div className="space-y-2">
                             {projectsUsing.map(p => (
                                <div key={p.id} className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.description}</p>
                                </div>
                             ))}
                        </div>
                    </div>
                )}
               
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                   <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        <TrashIcon /> Delete Component
                   </button>
                    <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSuggestion | null;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project }) => {
    const { components, addProject, projects } = useInventory();

    if (!project) return null;
    
    const projectExists = projects.some(p => p.name === project.name);

    const handleCreateProject = () => {
        const projectComponents: ProjectComponent[] = project.components
            .map(reqComponent => {
                const found = components.find(c => c.name.toLowerCase() === reqComponent.name.toLowerCase());
                if (found) {
                    return { componentId: found.id, quantity: reqComponent.quantity };
                }
                return null;
            })
            .filter((c): c is ProjectComponent => c !== null);

        addProject({
            name: project.name,
            description: project.description,
            components: projectComponents,
        });

        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h3>
                    <div className="flex items-center gap-2 my-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Difficulty:</span>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full ${i < project.difficulty ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Required Components</h4>
                    <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                        {project.components.map((c, i) => (
                            <li key={i} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md">
                                <span className={`truncate ${c.available ? 'text-gray-700 dark:text-gray-300' : 'text-red-500 dark:text-red-400'}`}>
                                   {c.quantity}x {c.name}
                                </span>
                                {c.available ? 
                                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Available</span> : 
                                    <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">Missing</span>}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                    <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                    <Button onClick={handleCreateProject} disabled={projectExists} title={projectExists ? 'This project is already in your list' : ''}>
                        {projectExists ? 'Project Exists' : 'Create Project'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

interface AddComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({ isOpen, onClose }) => {
    const { addComponent, addInventoryItem, locations } = useInventory();
    
    const [name, setName] = useState('');
    // FIX: Add state for simpleName.
    const [simpleName, setSimpleName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [specs, setSpecs] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [locationId, setLocationId] = useState(locations[0]?.id || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `comp-${Date.now()}`;
        const specsObject = specs.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(':');
            if (key && value) acc[key.trim()] = value.trim();
            return acc;
        }, {} as Record<string,string>);

        const newComponent: Component = {
            id: newId,
            name,
            // FIX: Add simpleName to the new component object.
            simpleName,
            category,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            specs: specsObject,
        };

        addComponent(newComponent);
        addInventoryItem({
            componentId: newId,
            quantity: Number(quantity),
            locationId
        });
        
        // Reset form
        setName('');
        // FIX: Reset simpleName state.
        setSimpleName('');
        setCategory('');
        setDescription('');
        setTags('');
        setSpecs('');
        setQuantity(1);
        setLocationId(locations[0]?.id || '');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manually Add Component">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style" htmlFor="comp-name">Component Name</label>
                    <input id="comp-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-style" placeholder="e.g., ATmega328P" required />
                </div>
                {/* FIX: Add input field for simpleName. */}
                <div>
                    <label className="label-style" htmlFor="comp-simple-name">Simple Name</label>
                    <input id="comp-simple-name" type="text" value={simpleName} onChange={e => setSimpleName(e.target.value)} className="input-style" placeholder="e.g., 8-bit Microcontroller" required />
                </div>
                <div>
                    <label className="label-style" htmlFor="comp-cat">Category</label>
                    <input id="comp-cat" type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-style" placeholder="e.g., MCU" required />
                </div>
                <div>
                    <label className="label-style" htmlFor="comp-desc">Description</label>
                    <textarea id="comp-desc" value={description} onChange={e => setDescription(e.target.value)} className="input-style" rows={2}></textarea>
                </div>
                <div>
                    <label className="label-style" htmlFor="comp-tags">Tags (comma-separated)</label>
                    <input id="comp-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="input-style" placeholder="e.g., arduino, microcontroller, dip" />
                </div>
                 <div>
                    <label className="label-style" htmlFor="comp-specs">Specs (one per line, format: Key:Value)</label>
                    <textarea id="comp-specs" value={specs} onChange={e => setSpecs(e.target.value)} className="input-style font-mono text-sm" rows={3} placeholder="Voltage: 5V&#10;Clock Speed: 16MHz"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="label-style" htmlFor="comp-qty">Initial Quantity</label>
                        <input id="comp-qty" type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input-style" required />
                    </div>
                     <div>
                        <label className="label-style" htmlFor="comp-loc">Location</label>
                        <select id="comp-loc" value={locationId} onChange={e => setLocationId(e.target.value)} className="input-style h-full" required>
                             {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
                    <Button type="submit">Add Component</Button>
                </div>
            </form>
        </Modal>
    );
};

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
    const { addProject, components } = useInventory();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [projectComponents, setProjectComponents] = useState<ProjectComponent[]>([]);
    
    const [selectedComponentId, setSelectedComponentId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const handleAddComponent = () => {
        if (selectedComponentId && selectedQuantity > 0 && !projectComponents.some(c => c.componentId === selectedComponentId)) {
            setProjectComponents([...projectComponents, { componentId: selectedComponentId, quantity: selectedQuantity }]);
            setSelectedComponentId('');
            setSelectedQuantity(1);
        }
    };
    
    const handleRemoveComponent = (componentId: string) => {
        setProjectComponents(projectComponents.filter(c => c.componentId !== componentId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProject({ name, description, components: projectComponents });
        setName('');
        setDescription('');
        setProjectComponents([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style" htmlFor="proj-name">Project Name</label>
                    <input id="proj-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-style" required />
                </div>
                <div>
                    <label className="label-style" htmlFor="proj-desc">Description</label>
                    <textarea id="proj-desc" value={description} onChange={e => setDescription(e.target.value)} className="input-style" rows={3}></textarea>
                </div>
                
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Required Components</h4>
                    {projectComponents.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {projectComponents.map(pc => {
                                const component = components.find(c => c.id === pc.componentId);
                                return (
                                    <div key={pc.componentId} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md text-sm">
                                        <span>{pc.quantity}x {component?.name || 'Unknown'}</span>
                                        <button type="button" onClick={() => handleRemoveComponent(pc.componentId)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex items-end gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                        <div className="flex-grow">
                            <label className="label-style text-xs" htmlFor="select-comp">Component</label>
                            <select id="select-comp" value={selectedComponentId} onChange={e => setSelectedComponentId(e.target.value)} className="input-style py-1 text-sm">
                                <option value="" disabled>Select a component...</option>
                                {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="w-20">
                            <label className="label-style text-xs" htmlFor="select-qty">Qty</label>
                            <input id="select-qty" type="number" min="1" value={selectedQuantity} onChange={e => setSelectedQuantity(Number(e.target.value))} className="input-style py-1 text-sm" />
                        </div>
                        <SecondaryButton type="button" onClick={handleAddComponent} className="h-full !px-3" disabled={!selectedComponentId}>
                            <PlusIcon />
                        </SecondaryButton>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <SecondaryButton type="button" onClick={onClose}>Cancel</SecondaryButton>
                    <Button type="submit" disabled={!name || projectComponents.length === 0}>Create Project</Button>
                </div>
            </form>
        </Modal>
    );
};