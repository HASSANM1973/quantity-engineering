from .foundation import FoundationCalculator
from .column import ColumnCalculator
from .beam import BeamCalculator
from .solid_slab import SolidSlabCalculator
from .ribbed_slab import RibbedSlabCalculator
from .steel import SteelBeamCalculator, SteelColumnCalculator, SteelConnectionCalculator
from .retaining_stairs import RetainingWallCalculator, StairsCalculator
from .masonry import BlockworkCalculator, BrickworkCalculator
from .finishing import TilingCalculator, PaintingCalculator
from .insulation import WaterproofingCalculator, InsulationCalculator
from .earthwork import EarthworkCalculator
from .infrastructure import (
    RoadPavementCalculator, WaterPipeCalculator, SewagePipeCalculator,
    ManholeCalculator, SidewalkCalculator, CurbCalculator,
    StormDrainageCalculator, WaterTankCalculator, StreetLightingCalculator,
)

CALCULATOR_MAP = {
    'foundation': FoundationCalculator,
    'column': ColumnCalculator,
    'beam': BeamCalculator,
    'solid_slab': SolidSlabCalculator,
    'ribbed_slab': RibbedSlabCalculator,
    'steel_beam': SteelBeamCalculator,
    'steel_column': SteelColumnCalculator,
    'steel_connection': SteelConnectionCalculator,
    'retaining_wall': RetainingWallCalculator,
    'stairs': StairsCalculator,
    'blockwork': BlockworkCalculator,
    'brickwork': BrickworkCalculator,
    'tiling': TilingCalculator,
    'painting': PaintingCalculator,
    'waterproofing': WaterproofingCalculator,
    'insulation': InsulationCalculator,
    'earthwork': EarthworkCalculator,
    # Infrastructure
    'road_pavement': RoadPavementCalculator,
    'water_pipe': WaterPipeCalculator,
    'sewage_pipe': SewagePipeCalculator,
    'manhole': ManholeCalculator,
    'sidewalk': SidewalkCalculator,
    'curb': CurbCalculator,
    'storm_drainage': StormDrainageCalculator,
    'water_tank': WaterTankCalculator,
    'street_lighting': StreetLightingCalculator,
}


def get_calculator(element_type, dimensions, count=1):
    cls = CALCULATOR_MAP.get(element_type)
    if not cls:
        raise ValueError(f'No calculator found for element type: {element_type}')
    return cls(dimensions, count)
