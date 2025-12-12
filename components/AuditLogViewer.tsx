
import React, { useEffect, useState } from 'react';
import { AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { ShieldAlert, CheckCircle, XCircle, Search } from 'lucide-react';

const AuditLogViewer: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        const fetchLogs = async () => {
            const data = await mockBackend.audit.getLogs(user.id);
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }
  }, [user]);

  if (loading) return <div className="text-sm text-slate-500">Loading secure logs...</div>;

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <ShieldAlert className="text-slate-500" size={20} />
            <p className="text-xs text-slate-500">
                This is a tamper-proof log of all critical actions regarding your data.
            </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Resource</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">No activity recorded yet.</td>
                        </tr>
                    ) : (
                        logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleDateString()} <br/>
                                    <span className="text-xs opacity-70">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </td>
                                <td className="p-4 font-medium text-slate-900">{log.action}</td>
                                <td className="p-4 text-slate-600">{log.actor}</td>
                                <td className="p-4 text-slate-500">{log.resource}</td>
                                <td className="p-4">
                                    {log.status === 'ALLOWED' ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                            <CheckCircle size={12} /> Allowed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-full w-fit">
                                            <XCircle size={12} /> Denied
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AuditLogViewer;
