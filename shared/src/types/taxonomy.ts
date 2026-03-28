export interface Taxonomy {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface CreateTaxonomyRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateTaxonomyRequest {
  name?: string;
  icon?: string;
  color?: string;
}

export interface ReorderTaxonomiesRequest {
  orderedIds: number[];
}
