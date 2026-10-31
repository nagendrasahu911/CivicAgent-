import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Department } from '../types';
import { Building2, Users, Clock, ShieldCheck, Mail } from 'lucide-react';

export const DepartmentManagementView: React.FC = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeptData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, offRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/departments/officers', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (offRes.ok) setOfficers(await offRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeptData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-teal-400" />
          Department Directories & Service Level Agreements
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configured municipal divisions, target SLA resolution response times, and field officer team allocations.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading directories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => {
            const deptOfficers = officers.filter((o) => o.department_id === dept.id);
            return (
              <div
                key={dept.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 px-2.5 py-0.5 rounded border border-teal-800">
                      {dept.code}
                    </span>
                    <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> SLA Target: {dept.sla_hours} hours
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{dept.description}</p>

                  <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{dept.contact_email}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Field Officers ({deptOfficers.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {deptOfficers.length > 0 ? (
                      deptOfficers.map((off) => (
                        <span
                          key={off.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5"
                        >
                          <Users className="w-3 h-3 text-teal-400" />
                          {off.name} ({off.active_assignments || 0} active)
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No direct officers assigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
