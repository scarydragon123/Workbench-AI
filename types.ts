
export interface Component {
  id: string;
  name: string;
  category: string;
  specs: Record<string, string>;
  tags: string[];
  imageUrl?: string;
  description?: string;
  typicalUses?: string[];
  recommendedCircuits?: string[];
}

export interface InventoryItem {
  componentId: string;
  quantity: number;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
}

export interface ProjectSuggestion {
  name: string;
  description: string;
  difficulty: number;
  components: {
    name: string;
    quantity: number;
    available: boolean;
  }[];
}

export enum View {
  IDENTIFY,
  INVENTORY,
  PROJECTS,
  LOCATIONS,
}