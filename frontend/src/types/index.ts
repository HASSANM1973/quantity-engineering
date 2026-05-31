export interface Project {
  id: number
  name: string
  description: string
  location: string
  project_type: string
  created_at: string
  updated_at: string
  sites: Site[]
}

export interface Site {
  id: number
  project: number
  name: string
  description: string
  site_area: number
  floors: Floor[]
}

export interface Floor {
  id: number
  site: number
  name: string
  floor_number: number
  level_elevation: number
  floor_area: number
}

export interface Element {
  id: number
  floor: number | null
  project: number | null
  element_type: string
  name: string
  count: number
  dimensions: Record<string, number>
  concrete_grade: string
  notes: string
  quantities: MaterialQuantity[]
}

export interface MaterialQuantity {
  id: number
  element: number
  material_type: string
  unit: string
  value: number
  spec_reference: string
}

export interface CalcResult {
  concrete?: { value: number; unit: string; spec_reference: string }
  rebar?: { value: number; unit: string; spec_reference: string }
  formwork?: { value: number; unit: string; spec_reference: string }
  steel_beam?: { value: number; unit: string; spec_reference: string; details?: any }
  steel_column?: { value: number; unit: string; spec_reference: string; details?: any }
  bolts?: { value: number; unit: string; spec_reference: string }
  plate?: { value: number; unit: string; spec_reference: string }
  weld?: { value: number; unit: string; spec_reference: string }
  bending_schedule?: BendingBar[]
}

export interface BendingBar {
  dia: number
  us_size?: string
  count: number
  length?: number
  length_m?: number
  total_length_m?: number
  weight_kg?: number
  shape_code: string
  shape_desc: string
}

export type ElementType =
  | 'foundation' | 'column' | 'beam'
  | 'solid_slab' | 'ribbed_slab'
  | 'steel_beam' | 'steel_column' | 'steel_connection'
  | 'retaining_wall' | 'stairs'
  | 'blockwork' | 'brickwork' | 'tiling' | 'painting'
  | 'waterproofing' | 'insulation' | 'earthwork'
  // Infrastructure
  | 'road_pavement' | 'water_pipe' | 'sewage_pipe' | 'manhole'
  | 'sidewalk' | 'curb' | 'storm_drainage' | 'water_tank' | 'street_lighting'

export const ELEMENT_TYPES: { value: ElementType; label: string; group: string }[] = [
  { value: 'foundation', label: 'Foundation', group: 'RC Elements' },
  { value: 'column', label: 'Column', group: 'RC Elements' },
  { value: 'beam', label: 'Beam', group: 'RC Elements' },
  { value: 'solid_slab', label: 'Solid Slab', group: 'RC Elements' },
  { value: 'ribbed_slab', label: 'Ribbed Slab', group: 'RC Elements' },
  { value: 'retaining_wall', label: 'Retaining Wall', group: 'RC Elements' },
  { value: 'stairs', label: 'Stairs', group: 'RC Elements' },
  { value: 'steel_beam', label: 'Steel Beam (AISC)', group: 'Steel (AISC)' },
  { value: 'steel_column', label: 'Steel Column (AISC)', group: 'Steel (AISC)' },
  { value: 'steel_connection', label: 'Steel Connection', group: 'Steel (AISC)' },
  { value: 'blockwork', label: 'Blockwork', group: 'Masonry' },
  { value: 'brickwork', label: 'Brickwork', group: 'Masonry' },
  { value: 'tiling', label: 'Tiling', group: 'Finishing' },
  { value: 'painting', label: 'Painting', group: 'Finishing' },
  { value: 'waterproofing', label: 'Waterproofing', group: 'Insulation' },
  { value: 'insulation', label: 'Insulation', group: 'Insulation' },
  { value: 'earthwork', label: 'Earthwork', group: 'Earthwork' },
  // Infrastructure
  { value: 'road_pavement', label: 'Road Pavement', group: 'Infrastructure' },
  { value: 'water_pipe', label: 'Water Supply Pipe', group: 'Infrastructure' },
  { value: 'sewage_pipe', label: 'Sewage Pipe', group: 'Infrastructure' },
  { value: 'manhole', label: 'Manhole', group: 'Infrastructure' },
  { value: 'sidewalk', label: 'Sidewalk', group: 'Infrastructure' },
  { value: 'curb', label: 'Curb / Road Barrier', group: 'Infrastructure' },
  { value: 'storm_drainage', label: 'Storm Drainage', group: 'Infrastructure' },
  { value: 'water_tank', label: 'Water Tank', group: 'Infrastructure' },
  { value: 'street_lighting', label: 'Street Lighting', group: 'Infrastructure' },
]

export const ELEMENT_DIMENSIONS: Record<ElementType, { key: string; label: string; default: number }[]> = {
  foundation: [
    { key: 'length', label: 'Length (m)', default: 2.0 },
    { key: 'width', label: 'Width (m)', default: 2.0 },
    { key: 'height', label: 'Height (m)', default: 0.5 },
    { key: 'bar_diameter', label: 'Bar Diameter (mm)', default: 12 },
    { key: 'spacing', label: 'Spacing (m)', default: 0.15 },
    { key: 'cover', label: 'Cover (m)', default: 0.05 },
  ],
  column: [
    { key: 'width', label: 'Width (m)', default: 0.3 },
    { key: 'depth', label: 'Depth (m)', default: 0.3 },
    { key: 'height', label: 'Height (m)', default: 3.0 },
    { key: 'bar_diameter', label: 'Main Bar Dia (mm)', default: 16 },
    { key: 'bar_count', label: 'Number of Bars', default: 8 },
    { key: 'tie_diameter', label: 'Tie Diameter (mm)', default: 10 },
    { key: 'tie_spacing', label: 'Tie Spacing (m)', default: 0.20 },
    { key: 'cover', label: 'Cover (m)', default: 0.04 },
  ],
  beam: [
    { key: 'width', label: 'Width (m)', default: 0.3 },
    { key: 'depth', label: 'Depth (m)', default: 0.5 },
    { key: 'length', label: 'Length (m)', default: 5.0 },
    { key: 'span_count', label: 'Number of Spans', default: 1 },
    { key: 'bar_diameter_top', label: 'Top Bar Dia (mm)', default: 16 },
    { key: 'bar_diameter_bottom', label: 'Bottom Bar Dia (mm)', default: 16 },
    { key: 'bar_count_top', label: 'Top Bars Count', default: 3 },
    { key: 'bar_count_bottom', label: 'Bottom Bars Count', default: 3 },
    { key: 'stirrup_diameter', label: 'Stirrup Dia (mm)', default: 10 },
    { key: 'stirrup_spacing', label: 'Stirrup Spacing (m)', default: 0.15 },
    { key: 'cover', label: 'Cover (m)', default: 0.04 },
  ],
  solid_slab: [
    { key: 'length', label: 'Length (m)', default: 6.0 },
    { key: 'width', label: 'Width (m)', default: 4.0 },
    { key: 'thickness', label: 'Thickness (m)', default: 0.15 },
    { key: 'bar_diameter', label: 'Bar Diameter (mm)', default: 12 },
    { key: 'spacing', label: 'Spacing (m)', default: 0.15 },
    { key: 'cover', label: 'Cover (m)', default: 0.025 },
  ],
  ribbed_slab: [
    { key: 'length', label: 'Length (m)', default: 8.0 },
    { key: 'width', label: 'Width (m)', default: 6.0 },
    { key: 'topping_slab_thickness', label: 'Topping Slab Thickness (m)', default: 0.07 },
    { key: 'rib_width', label: 'Rib Width (m)', default: 0.12 },
    { key: 'rib_depth', label: 'Rib Depth (m)', default: 0.25 },
    { key: 'rib_spacing', label: 'Rib Spacing (m)', default: 0.50 },
    { key: 'bar_diameter', label: 'Mesh Bar Diameter (mm)', default: 12 },
    { key: 'spacing', label: 'Mesh Spacing (m)', default: 0.15 },
    { key: 'cover', label: 'Cover (m)', default: 0.025 },
  ],
  steel_beam: [
    { key: 'shape_name', label: 'Shape Name (e.g. W12x26)', default: 0 },
    { key: 'length', label: 'Length (m)', default: 6.0 },
  ],
  steel_column: [
    { key: 'shape_name', label: 'Shape Name (e.g. W14x43)', default: 0 },
    { key: 'height', label: 'Height (m)', default: 3.0 },
  ],
  steel_connection: [
    { key: 'bolt_diameter_mm', label: 'Bolt Diameter (mm)', default: 20 },
    { key: 'bolt_count', label: 'Bolt Count', default: 8 },
    { key: 'plate_thickness_mm', label: 'Plate Thickness (mm)', default: 10 },
    { key: 'plate_area_m2', label: 'Plate Area (m²)', default: 0.15 },
    { key: 'weld_length_m', label: 'Weld Length (m)', default: 0.5 },
  ],
  retaining_wall: [
    { key: 'length', label: 'Length (m)', default: 10 },
    { key: 'stem_height', label: 'Stem Height (m)', default: 3 },
    { key: 'stem_top_thickness', label: 'Stem Top Thickness (m)', default: 0.2 },
    { key: 'stem_bottom_thickness', label: 'Stem Bottom Thickness (m)', default: 0.3 },
    { key: 'base_width', label: 'Base Width (m)', default: 2.5 },
    { key: 'base_thickness', label: 'Base Thickness (m)', default: 0.4 },
    { key: 'bar_diameter', label: 'Vertical Bar Dia (mm)', default: 16 },
    { key: 'spacing', label: 'Vertical Spacing (m)', default: 0.15 },
    { key: 'horizontal_bar_diameter', label: 'Horizontal Bar Dia (mm)', default: 12 },
    { key: 'horizontal_spacing', label: 'Horizontal Spacing (m)', default: 0.20 },
  ],
  stairs: [
    { key: 'width', label: 'Width (m)', default: 1.2 },
    { key: 'rise', label: 'Rise (m)', default: 0.15 },
    { key: 'tread', label: 'Tread (m)', default: 0.30 },
    { key: 'number_of_steps', label: 'Number of Steps', default: 20 },
    { key: 'landing_thickness', label: 'Landing Thickness (m)', default: 0.15 },
    { key: 'landing_length', label: 'Landing Length (m)', default: 1.2 },
    { key: 'bar_diameter', label: 'Main Bar Diameter (mm)', default: 12 },
    { key: 'spacing', label: 'Spacing (m)', default: 0.15 },
    { key: 'distribution_bar_diameter', label: 'Distribution Bar (mm)', default: 10 },
  ],
  blockwork: [
    { key: 'wall_length', label: 'Wall Length (m)', default: 10 },
    { key: 'wall_height', label: 'Wall Height (m)', default: 3 },
    { key: 'openings_area_m2', label: 'Openings Area (m²)', default: 4 },
    { key: 'plaster_thickness_mm', label: 'Plaster Thickness (mm)', default: 15 },
  ],
  brickwork: [
    { key: 'wall_length', label: 'Wall Length (m)', default: 5 },
    { key: 'wall_height', label: 'Wall Height (m)', default: 2.5 },
    { key: 'openings_area_m2', label: 'Openings Area (m²)', default: 2 },
  ],
  tiling: [
    { key: 'area_m2', label: 'Area (m²)', default: 50 },
  ],
  painting: [
    { key: 'area_m2', label: 'Area (m²)', default: 100 },
  ],
  waterproofing: [
    { key: 'area_m2', label: 'Area (m²)', default: 80 },
  ],
  insulation: [
    { key: 'area_m2', label: 'Area (m²)', default: 60 },
    { key: 'thickness_mm', label: 'Thickness (mm)', default: 50 },
  ],
  earthwork: [
    { key: 'length', label: 'Length (m)', default: 20 },
    { key: 'width', label: 'Width (m)', default: 10 },
    { key: 'depth', label: 'Depth (m)', default: 3 },
  ],
  // Infrastructure
  road_pavement: [
    { key: 'length', label: 'Length (m)', default: 100 },
    { key: 'width', label: 'Width (m)', default: 8 },
    { key: 'asphalt_thickness', label: 'Asphalt Thickness (m)', default: 0.10 },
    { key: 'base_thickness', label: 'Base Course Thickness (m)', default: 0.20 },
    { key: 'subbase_thickness', label: 'Subbase Thickness (m)', default: 0.25 },
  ],
  water_pipe: [
    { key: 'length', label: 'Length (m)', default: 100 },
    { key: 'diameter_mm', label: 'Diameter (mm)', default: 100 },
    { key: 'avg_depth', label: 'Avg Depth (m)', default: 1.2 },
  ],
  sewage_pipe: [
    { key: 'length', label: 'Length (m)', default: 100 },
    { key: 'diameter_mm', label: 'Diameter (mm)', default: 200 },
    { key: 'avg_depth', label: 'Avg Depth (m)', default: 1.5 },
  ],
  manhole: [
    { key: 'depth', label: 'Depth (m)', default: 2.0 },
    { key: 'diameter', label: 'Diameter (m)', default: 1.5 },
    { key: 'wall_thickness', label: 'Wall Thickness (m)', default: 0.20 },
  ],
  sidewalk: [
    { key: 'length', label: 'Length (m)', default: 50 },
    { key: 'width', label: 'Width (m)', default: 2 },
    { key: 'thickness', label: 'Pavement Thickness (m)', default: 0.10 },
    { key: 'base_thickness', label: 'Base Thickness (m)', default: 0.15 },
  ],
  curb: [
    { key: 'length', label: 'Length (m)', default: 50 },
  ],
  storm_drainage: [
    { key: 'length', label: 'Length (m)', default: 100 },
    { key: 'diameter_mm', label: 'Diameter (mm)', default: 300 },
    { key: 'depth', label: 'Depth (m)', default: 1.5 },
  ],
  water_tank: [
    { key: 'capacity', label: 'Capacity (m³)', default: 100 },
    { key: 'height', label: 'Height (m)', default: 4.0 },
    { key: 'diameter', label: 'Diameter (m) - 0 for rectangular', default: 0 },
    { key: 'length', label: 'Length (m) - rectangular', default: 6 },
    { key: 'width', label: 'Width (m) - rectangular', default: 5 },
  ],
  street_lighting: [
    { key: 'pole_count', label: 'Pole Count', default: 10 },
    { key: 'pole_height', label: 'Pole Height (m)', default: 9 },
    { key: 'spacing', label: 'Spacing (m)', default: 30 },
    { key: 'cable_length', label: 'Cable Length (m) - 0 for auto', default: 0 },
  ],
}

export const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'infrastructure', label: 'Infrastructure' },
]

export const AISC_SHAPES = [
  'W8x10','W8x13','W8x18',
  'W10x12','W10x15','W10x22','W10x30',
  'W12x16','W12x22','W12x26','W12x35','W12x40','W12x50',
  'W14x22','W14x26','W14x30','W14x34','W14x43','W14x53','W14x61','W14x74','W14x90',
  'W16x26','W16x31','W16x36','W16x40','W16x45','W16x50','W16x57',
  'W18x35','W18x40','W18x46','W18x50','W18x55','W18x60','W18x65',
  'W21x44','W21x50','W21x55','W21x62','W21x68','W21x73','W21x83',
  'W24x55','W24x62','W24x68','W24x76','W24x84','W24x94',
  'W27x84','W27x94','W27x102',
  'W30x90','W30x99','W30x108','W30x116','W30x124',
  'W33x118','W33x130','W33x141',
  'W36x135','W36x150','W36x160','W36x170','W36x182',
]

export interface Activity {
  id: number
  project: number
  name: string
  description: string
  activity_type: string
  duration_days: number
  quantity: number
  unit: string
  productivity_rate: number
  crew_size: number
  order: number
  early_start: number
  early_finish: number
  late_start: number
  late_finish: number
  total_float: number
  is_critical: boolean
}

export interface MaterialPrice {
  id: number
  material_type: string
  unit: string
  unit_price: number
  category: string
}

export interface CostItem {
  id: number
  element: number | null
  element_name: string
  element_type: string
  material_type: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total_cost: number
}

export interface CostEstimate {
  id: number
  project: number
  name: string
  markup_percent: number
  items: CostItem[]
  total_material: number
  total_with_markup: number
}

export interface CPMResult {
  project_duration_days: number
  critical_path_count: number
  critical_path: string[]
  total_activities: number
  critical_activities: {
    id: number
    name: string
    es: number
    ef: number
    ls: number
    lf: number
    float: number
  }[]
}

export const STRING_DIMENSIONS: Record<string, { key: string; label: string; options: { value: string; label: string }[] }[]> = {
  blockwork: [
    {
      key: 'block_size',
      label: 'Block Size',
      options: [
        { value: '4_inch', label: '4 inch (100mm)' },
        { value: '6_inch', label: '6 inch (150mm)' },
        { value: '8_inch', label: '8 inch (200mm)' },
      ],
    },
    {
      key: 'mortar_mix',
      label: 'Mortar Mix',
      options: [
        { value: '1:3', label: '1:3 (Cement:Sand)' },
        { value: '1:4', label: '1:4 (Cement:Sand)' },
        { value: '1:5', label: '1:5 (Cement:Sand)' },
        { value: '1:6', label: '1:6 (Cement:Sand)' },
      ],
    },
  ],
  brickwork: [
    {
      key: 'mortar_mix',
      label: 'Mortar Mix',
      options: [
        { value: '1:3', label: '1:3 (Cement:Sand)' },
        { value: '1:4', label: '1:4 (Cement:Sand)' },
        { value: '1:5', label: '1:5 (Cement:Sand)' },
        { value: '1:6', label: '1:6 (Cement:Sand)' },
      ],
    },
  ],
  tiling: [
    {
      key: 'tile_type',
      label: 'Tile Type',
      options: [
        { value: 'ceramic', label: 'Ceramic' },
        { value: 'porcelain', label: 'Porcelain' },
        { value: 'marble', label: 'Marble' },
        { value: 'granite', label: 'Granite' },
        { value: 'vinyl', label: 'Vinyl' },
      ],
    },
  ],
  painting: [
    {
      key: 'paint_type',
      label: 'Paint Type',
      options: [
        { value: 'interior_emulsion', label: 'Interior Emulsion' },
        { value: 'exterior_emulsion', label: 'Exterior Emulsion' },
        { value: 'oil_based', label: 'Oil Based' },
      ],
    },
  ],
  waterproofing: [
    {
      key: 'waterproofing_type',
      label: 'Waterproofing Type',
      options: [
        { value: 'bituminous_membrane', label: 'Bituminous Membrane' },
        { value: 'liquid_membrane', label: 'Liquid Membrane' },
        { value: 'cementitious', label: 'Cementitious' },
        { value: 'pvc_membrane', label: 'PVC Membrane' },
      ],
    },
  ],
  insulation: [
    {
      key: 'insulation_type',
      label: 'Insulation Type',
      options: [
        { value: 'polystyrene_xps', label: 'Polystyrene XPS' },
        { value: 'polystyrene_eps', label: 'Polystyrene EPS' },
        { value: 'polyurethane', label: 'Polyurethane' },
        { value: 'rockwool', label: 'Rockwool' },
        { value: 'fiberglass', label: 'Fiberglass' },
      ],
    },
  ],
  earthwork: [
    {
      key: 'soil_type',
      label: 'Soil Type',
      options: [
        { value: 'sand', label: 'Sand' },
        { value: 'silty_sand', label: 'Silty Sand' },
        { value: 'clay', label: 'Clay' },
        { value: 'gravel', label: 'Gravel' },
        { value: 'rock', label: 'Rock' },
      ],
    },
  ],
  // Infrastructure
  water_pipe: [
    {
      key: 'pipe_material',
      label: 'Pipe Material',
      options: [
        { value: 'ductile_iron', label: 'Ductile Iron (DI)' },
        { value: 'pvc', label: 'PVC' },
        { value: 'hdpe', label: 'HDPE' },
      ],
    },
  ],
  sewage_pipe: [
    {
      key: 'pipe_material',
      label: 'Pipe Material',
      options: [
        { value: 'pvc', label: 'PVC' },
        { value: 'concrete', label: 'Concrete' },
        { value: 'ductile_iron', label: 'Ductile Iron (DI)' },
      ],
    },
  ],
  sidewalk: [
    {
      key: 'pavement_type',
      label: 'Pavement Type',
      options: [
        { value: 'interlock', label: 'Interlock Pavers' },
        { value: 'tiles', label: 'Tiles' },
        { value: 'concrete', label: 'Cast-in-place Concrete' },
      ],
    },
  ],
  curb: [
    {
      key: 'curb_type',
      label: 'Curb Type',
      options: [
        { value: 'mountable', label: 'Mountable Curb' },
        { value: 'barrier', label: 'Barrier Curb' },
        { value: 'gutter', label: 'Gutter' },
      ],
    },
  ],
  storm_drainage: [
    {
      key: 'pipe_material',
      label: 'Pipe Material',
      options: [
        { value: 'concrete', label: 'Concrete' },
        { value: 'pvc', label: 'PVC' },
        { value: 'hdpe', label: 'HDPE' },
      ],
    },
  ],
}
