import React, { useEffect, useState } from 'react';
import { RiskRadarData } from '../types';
import { GoogleMap } from '../components/GoogleMap';
import { 
  BarChart3, AlertTriangle, ShieldAlert, 
  Building2, Layers, CheckCircle2, Info, Flame
} from 'lucide-react';

export const CivicRiskRadarView: React.FC = () => {
  const [data, setData] = useState<RiskRadarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRadar = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/analytics/risk-radar');
        if (res.ok) {
          const radar: RiskRadarData = await res.json();
          setData(radar);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRadar();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Aggregating spatial risk radar and municipal metrics...
      </div>
    );
  }

  const mapMarkers = data.hotspots.map((h) => ({
    id: h.id,
    lat: h.latitude,
    lon: h.longitude,
    title: h.title,
    category: h.category,
    status: 'submitted',
    severity_label: h.severity_label,
    ticket_number: h.ticket_number,
    address: h.selected_address || `${h.locality}`,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          Predictive Heuristics & Spatial Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          Civic Risk Radar & Hotspot Analytics
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Aggregates recurring incident density, high-risk safety hazards, and department response SLAs across municipal wards.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Tracked Complaints</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {data.summary.total_complaints}
          </div>
          <span className="text-[11px] text-teal-400">Public & Anonymized Feeds</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Urgent Unresolved Hazards</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            {data.summary.urgent_unresolved}
          </div>
          <span className="text-[11px] text-rose-400/80">Severity Score &gt;= 80</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Awaiting Citizen Feedback</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {data.summary.awaiting_citizen_feedback}
          </div>
          <span className="text-[11px] text-emerald-400/80">Repairs Pending Verification</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Avg Citizen Satisfaction</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            ★ {data.summary.average_citizen_satisfaction} / 5.0
          </div>
          <span className="text-[11px] text-slate-400">Post-Resolution Audits</span>
        </div>
      </div>

      {/* Spatial Hotspot Map */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Spatial Civic Hotspots & Incident Clusters</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Red markers designate Urgent Review hazards (e.g. snapping 11kV cables, open deep craters).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Urgent (80+)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High (60+)
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Medium
            </span>
          </div>
        </div>

        <GoogleMap
          mode="radar"
          center={[28.62, 77.20]}
          zoom={12}
          markers={mapMarkers}
          showRadarCircles={true}
          height="460px"
        />
      </div>

      {/* Two Column Section: Category Distribution & Department Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Recurring Complaint Categories</h3>
          <div className="space-y-3 pt-2">
            {data.category_distribution.map((cat) => {
              const maxVal = Math.max(...data.category_distribution.map((c) => c.count), 1);
              const pct = (cat.count / maxVal) * 100;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <span className="font-mono text-teal-400 font-bold">{cat.count} reports</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload & Backlog */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Department Workload & Active Backlog</h3>
          <div className="space-y-3 pt-1">
            {data.department_workload.map((dept) => (
              <div
                key={dept.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{dept.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>SLA: {dept.sla_hours}h</span>
                    <span>Total: {dept.total_assigned}</span>
                    <span>Resolved: {dept.resolved_count}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-amber-400 block">
                    {dept.active_backlog} active
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Backlog queue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Transparency Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Synthetic Demo & Benchmark Modeling Disclosure:</strong> Risk radar metrics are 
          computed using prototype multi-factor heuristic weights (Safety Risk 40%, Public Impact 25%, Time 15%, Evidence 10%, Cluster Density 10%). 
          In life-threatening situations, emergency services should be contacted directly.
        </p>
      </div>
    </div>
  );
};
