from abc import ABC, abstractmethod
from .aci_rebar import bending_schedule, development_length_tension, lap_splice_tension, standard_hook_development


class BaseCalculator(ABC):
    element_type = None

    def __init__(self, dimensions, count=1):
        self.dimensions = dimensions
        self.count = count

    def get_d(self, key, default=0):
        val = self.dimensions.get(key, default)
        try:
            return float(val)
        except (ValueError, TypeError):
            return float(default)

    def get_s(self, key, default=''):
        val = self.dimensions.get(key, default)
        if isinstance(val, str):
            return val
        return str(val)

    @abstractmethod
    def concrete_volume(self):
        pass

    @abstractmethod
    def formwork_area(self):
        pass

    @abstractmethod
    def rebar_weight(self):
        pass

    def extra_results(self):
        return {}

    def bar_schedule(self):
        return []

    def calculate_all(self):
        results = {
            'concrete': {
                'value': round(self.concrete_volume(), 3),
                'unit': 'm3',
                'spec_reference': 'ACI 318-19'
            },
            'rebar': {
                'value': round(self.rebar_weight(), 2),
                'unit': 'kg',
                'spec_reference': 'ACI 318-19 / ASTM A615'
            },
            'formwork': {
                'value': round(self.formwork_area(), 3),
                'unit': 'm2',
                'spec_reference': 'ACI 347'
            },
        }
        extra = self.extra_results()
        if extra:
            results.update(extra)
        bbs = self.bar_schedule()
        if bbs:
            results['bending_schedule'] = bbs
        return results
