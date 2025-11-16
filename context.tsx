import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { InventoryItem, Component, Location } from './types';

interface InventoryContextType {
  components: Component[];
  inventory: InventoryItem[];
  locations: Location[];
  addComponent: (component: Component) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (componentId: string, locationId: string, quantity: number) => void;
  addLocation: (location: Omit<Location, 'id'>) => void;
  findComponentById: (id: string) => Component | undefined;
  findLocationById: (id: string) => Location | undefined;
  getInventoryWithDetails: () => (InventoryItem & { component: Component; location: Location })[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialLocations: Location[] = [
    { id: 'loc-1', name: 'Main Drawer Unit', description: 'The big blue tower of drawers.' },
    { id: 'loc-2', name: 'Resistor Box', description: 'The box with resistor strips.' },
    { id: 'loc-3', name: 'IC Tray', description: 'Anti-static foam for integrated circuits.' },
];

const initialComponents: Component[] = [
    { id: 'comp-1', name: '10kΩ Resistor', category: 'Passive', specs: { Resistance: '10kΩ', Tolerance: '5%', Power: '1/4W' }, tags: ['pull-up', 'voltage-divider'], description: 'A common resistor used in many circuits.' },
    { id: 'comp-2', name: 'ESP32-WROOM-32', category: 'MCU', specs: { 'Wi-Fi': '802.11 b/g/n', Bluetooth: 'v4.2 BR/EDR & BLE' }, tags: ['iot', 'wifi', 'microcontroller'], description: 'A powerful microcontroller with integrated Wi-Fi and Bluetooth.' },
];

const initialInventory: InventoryItem[] = [
    { componentId: 'comp-1', locationId: 'loc-2', quantity: 150 },
    { componentId: 'comp-2', locationId: 'loc-1', quantity: 5 },
];


export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Component[]>(() => {
    const saved = localStorage.getItem('ws_components');
    return saved ? JSON.parse(saved) : initialComponents;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('ws_inventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('ws_locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  useEffect(() => {
    localStorage.setItem('ws_components', JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem('ws_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('ws_locations', JSON.stringify(locations));
  }, [locations]);

  const addComponent = (component: Component) => {
    if (!components.some(c => c.id === component.id)) {
        setComponents(prev => [...prev, component]);
    }
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => {
        const existing = prev.find(i => i.componentId === item.componentId && i.locationId === item.locationId);
        if (existing) {
            return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
        }
        return [...prev, item];
    });
  };

    const updateInventoryItem = (componentId: string, locationId: string, quantity: number) => {
        setInventory(prev => {
            if (quantity <= 0) {
                return prev.filter(item => !(item.componentId === componentId && item.locationId === locationId));
            }
            return prev.map(item =>
                item.componentId === componentId && item.locationId === locationId
                    ? { ...item, quantity }
                    : item
            );
        });
    };

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation = { ...location, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLocation]);
  };
  
  const findComponentById = useCallback((id: string) => components.find(c => c.id === id), [components]);
  const findLocationById = useCallback((id: string) => locations.find(l => l.id === id), [locations]);

  const getInventoryWithDetails = useCallback(() => {
    return inventory
        .map(item => {
            const component = findComponentById(item.componentId);
            const location = findLocationById(item.locationId);
            if (component && location) {
                return { ...item, component, location };
            }
            return null;
        })
        .filter((item): item is InventoryItem & { component: Component; location: Location } => item !== null);
  }, [inventory, findComponentById, findLocationById]);

  return (
    <InventoryContext.Provider value={{ components, inventory, locations, addComponent, addInventoryItem, updateInventoryItem, addLocation, findComponentById, findLocationById, getInventoryWithDetails }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
