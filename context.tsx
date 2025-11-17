import React, { createContext, useState, useEffect, useContext, useCallback, useMemo, ReactNode } from 'react';
import { InventoryItem, Component, Location as LocationType, Project } from './types';
import { useAuth } from './auth';
import { db } from './firebase';
// FIX: Use Firebase v8 compatible API. The modular imports are removed as they are not available in the environment.
// import { collection, doc, getDocs, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';

interface InventoryContextType {
  components: Component[];
  inventory: InventoryItem[];
  locations: LocationType[];
  projects: Project[];
  loading: boolean;
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

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [components, setComponents] = useState<Component[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // FIX: Use Firebase v8 compatible API for collection references.
          const componentsRef = db.collection('users').doc(currentUser.uid).collection('components');
          const inventoryRef = db.collection('users').doc(currentUser.uid).collection('inventory');
          const locationsRef = db.collection('users').doc(currentUser.uid).collection('locations');
          const projectsRef = db.collection('users').doc(currentUser.uid).collection('projects');

          const [componentsSnap, inventorySnap, locationsSnap, projectsSnap] = await Promise.all([
            // FIX: Use Firebase v8 compatible API for getting documents.
            componentsRef.get(),
            inventoryRef.get(),
            locationsRef.get(),
            projectsRef.get()
          ]);

          setComponents(componentsSnap.docs.map(doc => doc.data() as Component));
          setInventory(inventorySnap.docs.map(doc => doc.data() as InventoryItem));
          setLocations(locationsSnap.docs.map(doc => doc.data() as LocationType));
          setProjects(projectsSnap.docs.map(doc => doc.data() as Project));

        } catch (error) {
          console.error("Failed to fetch data from Firestore", error);
        } finally {
          setLoading(false);
        }
      } else {
        setComponents([]);
        setInventory([]);
        setLocations([]);
        setProjects([]);
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const addComponent = useCallback(async (component: Component) => {
    if (!currentUser) return;
    try {
      // FIX: Use Firebase v8 compatible API for document references and setting data.
      const componentRef = db.collection('users').doc(currentUser.uid).collection('components').doc(component.id);
      await componentRef.set(component);
      setComponents(prev => [...prev, component]);
    } catch (error) {
      console.error("Error adding component: ", error);
    }
  }, [currentUser]);

  const deleteComponent = useCallback(async (componentId: string) => {
    if (!currentUser) return;
    try {
      // FIX: Use Firebase v8 compatible API for write batches.
      const batch = db.batch();
      const componentRef = db.collection('users').doc(currentUser.uid).collection('components').doc(componentId);
      batch.delete(componentRef);

      const inventoryToDelete = inventory.filter(i => i.componentId === componentId);
      inventoryToDelete.forEach(item => {
        const inventoryId = `${item.componentId}-${item.locationId}`;
        // FIX: Use Firebase v8 compatible API for document references.
        const inventoryRef = db.collection('users').doc(currentUser.uid).collection('inventory').doc(inventoryId);
        batch.delete(inventoryRef);
      });

      await batch.commit();

      setComponents(prev => prev.filter(c => c.id !== componentId));
      setInventory(prev => prev.filter(i => i.componentId !== componentId));
    } catch (error) {
      console.error("Error deleting component: ", error);
    }
  }, [currentUser, inventory]);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    if (!currentUser) return;
    try {
        const inventoryId = `${item.componentId}-${item.locationId}`;
        // FIX: Use Firebase v8 compatible API for document references.
        const inventoryRef = db.collection('users').doc(currentUser.uid).collection('inventory').doc(inventoryId);
        
        const existing = inventory.find(i => i.componentId === item.componentId && i.locationId === item.locationId);
        const newQuantity = existing ? existing.quantity + item.quantity : item.quantity;
        const newItemData = { ...item, quantity: newQuantity };

        // FIX: Use Firebase v8 compatible API for setting data.
        await inventoryRef.set(newItemData);
        
        if (existing) {
            setInventory(prev => prev.map(i => i.componentId === item.componentId && i.locationId === item.locationId ? newItemData : i));
        } else {
            setInventory(prev => [...prev, newItemData]);
        }
    } catch (error) {
        console.error("Error adding inventory item: ", error);
    }
  }, [currentUser, inventory]);

  const updateInventoryItem = useCallback(async (componentId: string, locationId: string, quantity: number) => {
    if (!currentUser) return;
    try {
        const inventoryId = `${componentId}-${locationId}`;
        // FIX: Use Firebase v8 compatible API for document references.
        const inventoryRef = db.collection('users').doc(currentUser.uid).collection('inventory').doc(inventoryId);
        
        if (quantity <= 0) {
            // FIX: Use Firebase v8 compatible API for deleting documents.
            await inventoryRef.delete();
            setInventory(prev => prev.filter(item => !(item.componentId === componentId && item.locationId === locationId)));
        } else {
            const updatedItem = { componentId, locationId, quantity };
            // FIX: Use Firebase v8 compatible API for setting data.
            await inventoryRef.set(updatedItem, { merge: true });
            setInventory(prev => prev.map(item =>
                item.componentId === componentId && item.locationId === locationId
                    ? { ...item, quantity }
                    : item
            ));
        }
    } catch (error) {
        console.error("Error updating inventory item: ", error);
    }
  }, [currentUser]);

  const addLocation = useCallback(async (location: Omit<LocationType, 'id'>) => {
    if (!currentUser) return;
    try {
        const newLocation = { ...location, id: `loc-${Date.now()}` };
        // FIX: Use Firebase v8 compatible API for document references and setting data.
        const locationRef = db.collection('users').doc(currentUser.uid).collection('locations').doc(newLocation.id);
        await locationRef.set(newLocation);
        setLocations(prev => [...prev, newLocation]);
    } catch (error) {
        console.error("Error adding location: ", error);
    }
  }, [currentUser]);

  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    if (!currentUser) return;
    try {
        const newProject = { ...project, id: `proj-${Date.now()}`};
        // FIX: Use Firebase v8 compatible API for document references and setting data.
        const projectRef = db.collection('users').doc(currentUser.uid).collection('projects').doc(newProject.id);
        await projectRef.set(newProject);
        setProjects(prev => [...prev, newProject]);
    } catch (error) {
        console.error("Error adding project: ", error);
    }
  }, [currentUser]);

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
    loading,
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
    loading,
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
