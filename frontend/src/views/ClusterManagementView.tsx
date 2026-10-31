import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IssueCluster } from '../types';
import { Layers, CheckCircle, GitMerge, XCircle, Shield, ArrowRight } from 'lucide-react';

export const ClusterManagementView: React.FC = () => {
  const { token } = useAuth();
  const [clusters, setClusters] = useState<IssueCluster[]>([]);
  const [targetMergeId, setTargetMergeId] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) {
        setClusters(await res.json());
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

  const handleClusterAction = async (clusterId: string, action: 'confirm' | 'merge' | 'reject') => {
    if (action === 'merge' && !targetMergeId) {
      alert("Please select a target cluster to merge into.");
      return;
    }

    try {
      const res = await fetch(`/api/clusters/${clusterId}/officer-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          target_cluster_id: action === 'merge' ? targetMergeId : null,
          notes: actionNotes || `Action ${action} executed by authorized moderator.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setActionNotes('');
        setTargetMergeId('');
        fetchClusters();
      } else {
        const err = await res.json();
        alert(err.detail || "Action failed");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-teal-400" />
          Community Issue Cluster Operations & Triage
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized tools to confirm AI-suggested duplicate clusters, merge related incidents, or reject false matches.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading clusters...</div>
      ) : (
        <div className="space-y-4">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-400">{cluster.id}</span>
                    <span className="text-xs text-cyan-300 font-semibold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {cluster.category}
                    </span>
                    {cluster.confirmed_by_officer === 1 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        ✓ Officer Confirmed
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white">{cluster.title}</h3>
                  <p className="text-xs text-slate-400">📍 Locality: {cluster.locality}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <span className="block text-white font-bold text-sm">{cluster.complaint_count}</span>
                    <span className="text-slate-400 text-[10px]">Reports</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-cyan-400 font-bold text-sm">{cluster.support_count}</span>
                    <span className="text-slate-400 text-[10px]">Citizen Votes</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                <div className="flex items-center gap-2">
                  {cluster.confirmed_by_officer === 0 && (
                    <button
                      onClick={() => handleClusterAction(cluster.id, 'confirm')}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm Cluster
                    </button>
                  )}

                  <button
                    onClick={() => handleClusterAction(cluster.id, 'reject')}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Dismiss Cluster
                  </button>
                </div>

                {/* Merge into other cluster */}
                <div className="flex items-center gap-2">
                  <select
                    value={targetMergeId}
                    onChange={(e) => setTargetMergeId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  >
                    <option value="">Select Target Cluster to Merge into...</option>
                    {clusters
                      .filter((c) => c.id !== cluster.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.locality})
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => handleClusterAction(cluster.id, 'merge')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <GitMerge className="w-3.5 h-3.5" /> Merge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
