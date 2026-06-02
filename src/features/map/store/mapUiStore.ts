import { create } from 'zustand'
import { DEFAULT_MAP_FILTERS, type MapFilters } from '../types'

// UI do mapa que precisa ser tocada de fora da tela — o botão de filtro vive no
// GlobalHeader (global). Espelha o profileDrawerStore. Os filtros também moram
// aqui para serem lidos pela tela e escritos pelo sheet, persistindo na sessão.
type MapUiState = {
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
  filters: MapFilters
  setFilters: (next: MapFilters) => void
  resetFilters: () => void
}

export const useMapUiStore = create<MapUiState>(set => ({
  filtersOpen: false,
  setFiltersOpen: filtersOpen => set({ filtersOpen }),
  filters: DEFAULT_MAP_FILTERS,
  setFilters: filters => set({ filters }),
  resetFilters: () => set({ filters: DEFAULT_MAP_FILTERS }),
}))
