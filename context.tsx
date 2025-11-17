import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, ReactNode } from 'react';
import { InventoryItem, Component, Location as LocationType, Project } from './types';

interface InventoryContextType {
  components: Component[];
  inventory: InventoryItem[];
  locations: LocationType[];
  projects: Project[];
  addComponent: (component: Component) => void;
  deleteComponent: (componentId: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (componentId: string, locationId: string, quantity: number) => void;
  addLocation: (location: Omit<LocationType, 'id'>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  findComponentById: (id: string) => Component | undefined;
  findLocationById: (id: string) => LocationType | undefined;
  getInventoryWithDetails: () => (InventoryItem & { component: Component; location: LocationType })[];
  getProjectsForComponent: (componentId: string) => Project[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialLocations: LocationType[] = [
    { id: 'loc-1', name: 'Main Drawer Unit', description: 'The big blue tower of drawers.' },
    { id: 'loc-2', name: 'Resistor Box', description: 'The box with resistor strips.' },
    { id: 'loc-3', name: 'IC Tray', description: 'Anti-static foam for integrated circuits.' },
];

const initialComponents: Component[] = [
    { 
        id: 'comp-1', 
        name: '10kΩ Resistor', 
        // FIX: Add missing simpleName property.
        simpleName: 'Resistor',
        category: 'Passive', 
        specs: { Resistance: '10kΩ', Tolerance: '5%', Power: '1/4W' }, 
        tags: ['pull-up', 'voltage-divider'], 
        description: 'A common resistor used in many circuits to impede the flow of current.',
        typicalUses: ['Pull-up/pull-down resistor for digital logic', 'Voltage dividers', 'Current limiting for LEDs'],
        recommendedCircuits: ['Simple voltage divider with another resistor', 'RC filter with a capacitor']
    },
    { 
        id: 'comp-2', 
        name: 'ESP32-WROOM-32', 
        // FIX: Add missing simpleName property.
        simpleName: 'WiFi Microcontroller Module',
        category: 'MCU', 
        specs: { 'Wi-Fi': '802.11 b/g/n', Bluetooth: 'v4.2 BR/EDR & BLE' }, 
        tags: ['iot', 'wifi', 'microcontroller'], 
        description: 'A powerful microcontroller with integrated Wi-Fi and Bluetooth, ideal for IoT projects.',
        typicalUses: ['IoT sensor nodes', 'Home automation hubs', 'Wireless controllers'],
        recommendedCircuits: ['Basic power circuit (3.3V)', 'Connecting to I2C sensors like MPU-6050']
    },
];

const initialInventory: InventoryItem[] = [
    { componentId: 'comp-1', locationId: 'loc-2', quantity: 150 },
    { componentId: 'comp-2', locationId: 'loc-1', quantity: 5 },
];

const initialProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'IoT Weather Station',
        description: 'A simple weather station that reports temperature and humidity over WiFi.',
        components: [
            { componentId: 'comp-2', quantity: 1 }
        ]
    }
];


export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Component[]>(() => {
    try {
      const saved = localStorage.getItem('ws_components');
      return saved ? JSON.parse(saved) : initialComponents;
    } catch (error) {
      console.error("Failed to parse components from localStorage", error);
      return initialComponents;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ws_inventory');
      return saved ? JSON.parse(saved) : initialInventory;
    } catch (error) {
      console.error("Failed to parse inventory from localStorage", error);
      return initialInventory;
    }
  });

  const [locations, setLocations] = useState<LocationType[]>(() => {
    try {
      const saved = localStorage.getItem('ws_locations');
      return saved ? JSON.parse(saved) : initialLocations;
    } catch (error) {
      console.error("Failed to parse locations from localStorage", error);
      return initialLocations;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('ws_projects');
      return saved ? JSON.parse(saved) : initialProjects;
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
      return initialProjects;
    }
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
  
  useEffect(() => {
    localStorage.setItem('ws_projects', JSON.stringify(projects));
  }, [projects]);

  const addComponent = useCallback((component: Component) => {
    setComponents(prev => {
        if (!prev.some(c => c.id === component.id)) {
            return [...prev, component];
        }
        return prev;
    });
  }, []);

  const deleteComponent = useCallback((componentId: string) => {
    setComponents(prev => prev.filter(c => c.id !== componentId));
    setInventory(prev => prev.filter(i => i.componentId !== componentId));
  }, []);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => {
        const existing = prev.find(i => i.componentId === item.componentId && i.locationId === item.locationId);
        if (existing) {
            return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
        }
        return [...prev, item];
    });
  }, []);

    const updateInventoryItem = useCallback((componentId: string, locationId: string, quantity: number) => {
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
    }, []);

  const addLocation = useCallback((location: Omit<LocationType, 'id'>) => {
    const newLocation = { ...location, id: `loc-${Date.now()}` };
    setLocations(prev => [...prev, newLocation]);
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: `proj-${Date.now()}`};
    setProjects(prev => [...prev, newProject]);
  }, []);
  
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
        .filter((item): item is InventoryItem & { component: Component; location: LocationType } => item !== null);
  }, [inventory, findComponentById, findLocationById]);

  const getProjectsForComponent = useCallback((componentId: string) => {
      return projects.filter(p => p.components.some(c => c.componentId === componentId));
  }, [projects]);
  
  const value = useMemo(() => ({
    components, 
    inventory, 
    locations, 
    projects,
    addComponent, 
    deleteComponent, 
    addInventoryItem, 
    updateInventoryItem, 
    addLocation,
    addProject,
    findComponentById, 
    findLocationById, 
    getInventoryWithDetails,
    getProjectsForComponent,
  }), [
    components, 
    inventory, 
    locations, 
    projects,
    addComponent, 
    deleteComponent, 
    addInventoryItem, 
    updateInventoryItem, 
    addLocation, 
    addProject,
    findComponentById, 
    findLocationById, 
    getInventoryWithDetails,
    getProjectsForComponent,
  ]);


  return (
    <InventoryContext.Provider value={value}>
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
