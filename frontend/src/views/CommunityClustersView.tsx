import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IssueCluster, Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Layers, ThumbsUp, Users, MapPin, ArrowRight, 
  CheckCircle, FilePlus2, Check, ShieldCheck, FileImage
} from 'lucide-react';

interface CommunityClustersViewProps {
  onSelectComplaint: (id: string) => void;
  onNewComplaint: () => void;
}

export const CommunityClustersView: React.FC<CommunityClustersViewProps> = ({
  onSelectComplaint,
  onNewComplaint,
}) => {
  const { token, user } = useAuth();
  const [clusters, setClusters] = useState<IssueCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<IssueCluster | null>(null);
  const [isSupporting, setIsSupporting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) {
        const data: IssueCluster[] = await res.json();
        setClusters(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleSupport = async (clusterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSupporting(clusterId);
    try {
      const res = await fetch(`/api/clusters/${clusterId}/support`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        // Optimistically update counts
        setClusters((prev) =>
          prev.map((c) =>
            c.id === clusterId ? { ...c, support_count: c.support_count + 1, user_has_supported: true } : c
          )
        );
        if (selectedCluster && selectedCluster.id === clusterId) {
          setSelectedCluster({
            ...selectedCluster,
            support_count: selectedCluster.support_count + 1,
            user_has_supported: true,
          });
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Support vote could not be recorded.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsSupporting(null);
    }
  };

  const openClusterDetails = async (cluster: IssueCluster) => {
    try {
      const res = await fetch(`/api/clusters/${cluster.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const full = await res.json();
        setSelectedCluster(full);
      }
    } catch {
      setSelectedCluster(cluster);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Signature Feature: Community Issue Clustering
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Community Issue Clusters
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            When multiple citizens report the same road, garbage, or pipeline hazard, CivicSaathi AI groups them into 
            a unified community cluster. Support an existing cluster to elevate civic priority without creating duplicate paperwork!
          </p>
        </div>

        <button
          onClick={onNewComplaint}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <FilePlus2 className="w-4 h-4" />
          Report a Different Issue
        </button>
      </div>

      {/* Clusters List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading community clusters...</div>
      ) : clusters.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No active community clusters found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              onClick={() => openClusterDetails(cluster)}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-800">
                    📂 {cluster.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {cluster.confirmed_by_officer === 1 && (
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Officer Confirmed
                      </span>
                    )}
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {cluster.complaint_count} reports
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {cluster.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Affected Zone: <strong>{cluster.locality}</strong></span>
                </div>

                {/* Sample Evidence Thumbnails if available */}
                {cluster.sample_evidence && cluster.sample_evidence.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-1 font-semibold">
                      Public-Safe Incident Evidence ({cluster.sample_evidence.length} photos)
                    </span>
                    <div className="flex items-center gap-2">
                      {cluster.sample_evidence.map((img, i) => (
                        <img
                          key={i}
                          src={img.image_url}
                          alt="Cluster proof"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-800 shadow"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">{cluster.support_count}</span> citizens backed
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSupport(cluster.id, e)}
                    disabled={isSupporting === cluster.id || cluster.user_has_supported}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                      cluster.user_has_supported
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {cluster.user_has_supported ? 'Backed by You' : 'Support Issue'}
                  </button>

                  <span className="text-xs text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLUSTER DETAILS MODAL / DRAWER */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Community Issue Cluster • {selectedCluster.category}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedCluster.title}</h2>
                <p className="text-xs text-slate-400 mt-1">📍 Affected Zone: {selectedCluster.locality}</p>
              </div>

              <button
                onClick={() => setSelectedCluster(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Citizen Support</span>
                <span className="text-base font-bold text-cyan-400">{selectedCluster.support_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Linked Reports</span>
                <span className="text-base font-bold text-teal-400">{selectedCluster.complaint_count}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Department Status</span>
                <span className="text-base font-bold text-emerald-400">
                  {selectedCluster.department_name ? 'Assigned' : 'Under Review'}
                </span>
              </div>
            </div>

            {/* Linked Reports list */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Linked Citizen Reports in this Cluster:
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedCluster.complaints && selectedCluster.complaints.length > 0 ? (
                  selectedCluster.complaints.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCluster(null);
                        onSelectComplaint(c.id);
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-400">{c.ticket_number}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="font-medium text-slate-200 mt-1 line-clamp-1">{c.title}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No public reports visible under this cluster.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => handleSupport(selectedCluster.id, e)}
                disabled={selectedCluster.user_has_supported}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCluster.user_has_supported
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                {selectedCluster.user_has_supported ? 'You Have Supported This Issue' : 'Support This Community Issue'}
              </button>

              <button
                onClick={() => setSelectedCluster(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
