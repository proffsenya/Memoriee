export interface FilterParams {
  filterType: 'warm' | 'bw' | 'vintage' | 'cool' | 'sepia';
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  warmth: number;
  tint: number;
  fade: number;
  vignette: number;
}

export interface Filter {
  id: string;
  name: string;
  description?: string;
  type: 'preset' | 'custom';
  params: FilterParams;
  userId?: string;
  createdAt?: string;
}
