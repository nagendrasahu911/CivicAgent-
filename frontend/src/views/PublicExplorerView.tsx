import React, { useEffect, useState } from 'react';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { GoogleMap } from '../components/GoogleMap';
import { 
  Eye, Search, Filter, MapPin, ArrowRight, 
  ShieldCheck, Layers, FileText
} from 'lucide-react';

interface PublicExplorerViewProps {
  onSelectComplaint: (id: string) => void;
}

export const PublicExplorerView: React.FC<PublicExplorerViewProps> = ({ onSelectComplaint }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filtered, setFiltered] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicComplaints = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/complaints/public');
        if (res.ok) {
          const data: Complaint[] = await res.json();
          setComplaints(data);
          setFiltered(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicComplaints();
  }, []);

  useEffect(() => {
    let res = complaints;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      res = res.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ticket_number.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      res = res.filter((c) => c.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      res = res.filter((c) => c.severity_label === priorityFilter);
    }
    if (statusFilter !== 'all') {
      res = res.filter((c) => c.status === statusFilter);
    }
    setFiltered(res);
  }, [searchTerm, categoryFilter, priorityFilter, statusFilter, complaints]);

  const mapMarkers = filtered
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.id,
      lat: c.latitude!,
      lon: c.longitude!,
      title: c.title,
      category: c.category,
      status: c.status,
      severity_label: c.severity_label,
      ticket_number: c.ticket_number,
      support_count: c.cluster_support_count,
      address: c.selected_address || `${c.locality}${c.landmark ? ', ' + c.landmark : ''}`,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-[11px] font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sanitized Transparency Feed
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-6 h-6 text-teal-400" />
            Public Community Issue Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse public-authorized civic issues, track municipal response times, and verify accountability in your city.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Feed Grid
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'map' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Map View ({mapMarkers.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues or areas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="Potholes and damaged roads">Potholes & Roads</option>
            <option value="Garbage and sanitation">Garbage & Sanitation</option>
            <option value="Water leakage">Water Leakage</option>
            <option value="Drainage and waterlogging">Drainage & Flooding</option>
            <option value="Streetlight faults">Streetlights</option>
            <option value="Electricity hazards">Electricity Hazards</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Priority Levels</option>
            <option value="Urgent Review">Urgent Review (80-100)</option>
            <option value="High">High (60-79)</option>
            <option value="Medium">Medium (30-59)</option>
            <option value="Normal">Normal (0-29)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved_pending_feedback">Awaiting Citizen Feedback</option>
            <option value="reopened">Reopened</option>
            <option value="closed">Closed & Verified</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-2">
          <GoogleMap
            mode="display"
            center={[28.62, 77.20]}
            zoom={12}
            markers={mapMarkers}
            onMarkerClick={(marker) => onSelectComplaint(marker.id)}
            height="560px"
          />
          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <span>💡</span> Click any marker to view interactive InfoWindow with status badge, ticket number, category, and direct action link.
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading public complaints...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No public issues found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectComplaint(c.id)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/60 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-sm group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {c.ticket_number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={c.status} />
                    <PriorityBadge score={c.severity_score} label={c.severity_label} showScore={false} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {c.image_url && (
                  <div className="pt-1">
                    <img
                      src={c.image_url}
                      alt="Thumbnail"
                      className="h-28 w-full object-cover rounded-xl border border-slate-800"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">📍 {c.locality}</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Timeline & Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
