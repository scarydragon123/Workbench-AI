import React, { ReactNode } from 'react';
import { Component, Location, ProjectSuggestion, InventoryItem } from './types';
import { useInventory } from './context';

// --- Icons ---
const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
};

export const ScanIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
export const InventoryIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v1.518a2.25 2.25 0 01-.64 1.584l-3.223 3.223a1.875 1.875 0 01-2.652 0l-.707-.707a1.875 1.875 0 00-2.652 0l-3.223 3.223a2.25 2.25 0 01-1.584.64H4.5A2.25 2.25 0 012.25 18V7.125z" /></svg>;
export const ProjectsIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.125 18l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L19.5 18l-1.188.648a2.25 2.25 0 01-1.423 1.423z" /></svg>;
export const LocationIcon = () => <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
export const CloseIcon = () => <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
export const CheckIcon = () => <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
export const WarningIcon = () => <svg className="w-5 h-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
export const SearchIcon = () => <svg {...iconProps} strokeWidth={2} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const MinusIcon = () => <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>;


// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 transform transition-all duration-300 scale-95 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-teal-400">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Buttons ---
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button className={`bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`} {...props}>
      {children}
    </button>
  );
};
export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button className={`bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg transition duration-300 ${className}`} {...props}>
      {children}
    </button>
  );
};


// --- Cards ---
interface ComponentCardProps {
    component: Component;
    quantity: number;
    location: Location;
    onClick?: () => void;
}
export const ComponentCard: React.FC<ComponentCardProps> = ({ component, quantity, location, onClick }) => {
    const cardClasses = "bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col md:flex-row gap-4 transition-transform duration-200" + (onClick ? " cursor-pointer hover:border-teal-500 hover:scale-[1.02]" : "");
    return (
        <div className={cardClasses} onClick={onClick}>
            {component.imageUrl && <img src={component.imageUrl} alt={component.name} className="w-full md:w-24 h-24 object-cover rounded-md" />}
            <div className="flex-1">
                <h3 className="text-lg font-bold text-teal-400">{component.name}</h3>
                <p className="text-sm text-gray-400">{component.category}</p>
                <div className="text-2xl font-semibold my-2">{quantity} <span className="text-base font-normal text-gray-500">in stock</span></div>
                <p className="text-sm text-gray-300">
                    <span className="font-semibold">Location:</span> {location.name}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {component.tags.map(tag => (
                        <span key={tag} className="bg-gray-700 text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface ProjectCardProps {
    project: ProjectSuggestion;
}
export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
            <h3 className="text-xl font-bold text-teal-400 mb-2">{project.name}</h3>
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <span>Difficulty:</span>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full ${i < project.difficulty ? 'bg-teal-500' : 'bg-gray-600'}`}></div>
                    ))}
                </div>
            </div>
            <p className="text-gray-300 mb-4">{project.description}</p>
            <div>
                <h4 className="font-semibold mb-2">Required Components:</h4>
                <ul className="space-y-1 text-sm">
                    {project.components.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                            {c.available ? <CheckIcon /> : <WarningIcon />}
                            <span>{c.name} (x{c.quantity})</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


interface ComponentDetailModalProps {
    component: Component | null;
    isOpen: boolean;
    onClose: () => void;
}
export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({ component, isOpen, onClose }) => {
    const { inventory, updateInventoryItem, findLocationById } = useInventory();

    if (!component) return null;

    const inventoryForComponent = inventory.filter(item => item.componentId === component.id);

    const handleQuantityChange = (item: InventoryItem, delta: number) => {
        const newQuantity = item.quantity + delta;
        updateInventoryItem(item.componentId, item.locationId, newQuantity);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={component.name}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex flex-col md:flex-row gap-6">
                    {component.imageUrl && <img src={component.imageUrl} alt={component.name} className="w-full md:w-32 h-32 object-cover rounded-lg" />}
                    <div className="flex-1">
                        <p className="text-md text-gray-400 mb-2">{component.category}</p>
                        <p className="text-gray-300 mb-4">{component.description || "No description available."}</p>
                        <div className="flex flex-wrap gap-2">
                            {component.tags.map(tag => <span key={tag} className="bg-gray-700 text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Specifications:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 bg-gray-900/50 p-3 rounded-md">
                        {Object.entries(component.specs).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Inventory Details:</h4>
                    <div className="space-y-2">
                        {inventoryForComponent.map(item => {
                            const location = findLocationById(item.locationId);
                            return (
                                <div key={item.locationId} className="bg-gray-700/80 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{location?.name || 'Unknown Location'}</p>
                                        <p className="text-sm text-gray-400">{location?.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleQuantityChange(item, -1)} className="p-1 rounded-full bg-gray-600 hover:bg-red-500 transition-colors"><MinusIcon /></button>
                                        <span className="text-lg font-bold w-10 text-center">{item.quantity}</span>
                                        <button onClick={() => handleQuantityChange(item, 1)} className="p-1 rounded-full bg-gray-600 hover:bg-green-500 transition-colors"><PlusIcon /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            </div>
        </Modal>
    );
};
