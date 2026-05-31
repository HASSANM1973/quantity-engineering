from .models import Activity, Dependency


class CPMEngine:
    """
    Critical Path Method — calculates ES, EF, LS, LF, Float, Critical Path
    Supports FS, SS, FF, SF dependency types with lag.
    Uses iterative convergence to handle FF/SF/SS dependencies where
    the predecessor/successor may be processed in any order.
    """

    def __init__(self, project_id):
        self.project_id = project_id
        self.activities = list(Activity.objects.filter(project_id=project_id).order_by('order'))
        self.act_map = {a.id: a for a in self.activities}
        self.deps = list(Dependency.objects.filter(
            predecessor__project_id=project_id
        ).select_related('predecessor', 'successor'))

        self.fwd = {a.id: [] for a in self.activities}
        self.bwd = {a.id: [] for a in self.activities}
        for d in self.deps:
            self.fwd.setdefault(d.successor_id, []).append(d)
            self.bwd.setdefault(d.predecessor_id, []).append(d)

    def forward_pass(self):
        changed = True
        while changed:
            changed = False
            for act in self.activities:
                incoming = self.fwd.get(act.id, [])
                es = 0
                ef_constraint = 0
                for dep in incoming:
                    p = self.act_map[dep.predecessor_id]
                    if dep.dependency_type == 'FS':
                        es = max(es, p.early_finish + dep.lag_days)
                    elif dep.dependency_type == 'SS':
                        es = max(es, p.early_start + dep.lag_days)
                    elif dep.dependency_type == 'FF':
                        ef_constraint = max(ef_constraint, p.early_finish + dep.lag_days)
                    elif dep.dependency_type == 'SF':
                        ef_constraint = max(ef_constraint, p.early_start + dep.lag_days)
                new_es = es
                new_ef = max(es + act.duration_days, ef_constraint)
                if new_es != act.early_start or new_ef != act.early_finish:
                    act.early_start = new_es
                    act.early_finish = new_ef
                    changed = True

    def backward_pass(self):
        project_dur = max((a.early_finish for a in self.activities), default=0)

        for act in self.activities:
            act.late_finish = project_dur
            act.late_start = project_dur - act.duration_days

        changed = True
        while changed:
            changed = False
            for act in reversed(self.activities):
                outgoing = self.bwd.get(act.id, [])

                lf = project_dur
                ls_constraint = project_dur

                if outgoing:
                    lf = float('inf')
                    ls_constraint = float('inf')
                    for dep in outgoing:
                        s = self.act_map[dep.successor_id]
                        if dep.dependency_type == 'FS':
                            lf = min(lf, s.late_start - dep.lag_days)
                        elif dep.dependency_type == 'SS':
                            ls_constraint = min(ls_constraint, s.late_start - dep.lag_days)
                        elif dep.dependency_type == 'FF':
                            lf = min(lf, s.late_finish - dep.lag_days)
                        elif dep.dependency_type == 'SF':
                            ls_constraint = min(ls_constraint, s.late_finish - dep.lag_days)

                if lf == float('inf'):
                    lf = project_dur
                if ls_constraint == float('inf'):
                    ls_constraint = lf

                new_lf = lf
                new_ls = min(ls_constraint, lf - act.duration_days)

                if new_ls != act.late_start or new_lf != act.late_finish:
                    act.late_start = new_ls
                    act.late_finish = new_lf
                    changed = True

    def compute_float(self):
        for act in self.activities:
            act.total_float = act.late_start - act.early_start
            act.is_critical = abs(act.total_float) < 0.001

    def save_results(self):
        Activity.objects.bulk_update(
            self.activities,
            ['early_start', 'early_finish', 'late_start', 'late_finish',
             'total_float', 'is_critical']
        )

    def run(self):
        self.forward_pass()
        self.backward_pass()
        self.compute_float()
        self.save_results()

        critical = sorted([a for a in self.activities if a.is_critical], key=lambda a: a.early_start)
        project_dur = max((a.early_finish for a in self.activities), default=0)

        return {
            'project_duration_days': project_dur,
            'critical_path_count': len(critical),
            'critical_path': [a.name for a in critical],
            'total_activities': len(self.activities),
            'critical_activities': [{
                'id': a.id, 'name': a.name,
                'es': a.early_start, 'ef': a.early_finish,
                'ls': a.late_start, 'lf': a.late_finish,
                'float': a.total_float,
            } for a in critical],
        }
