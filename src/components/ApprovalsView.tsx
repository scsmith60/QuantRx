import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Building, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface OnboardingLead {
    id: string;
    practice_name: string;
    npi_number: string;
    admin_email: string;
    full_name: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

const ApprovalsView: React.FC = () => {
    const [leads, setLeads] = useState<OnboardingLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('onboarding_leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Leads Fetch Error:", error);
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (lead: OnboardingLead) => {
        setProcessingId(lead.id);
        
        // 1. Call the "Approve Practice" RPC function
        const { data, error } = await supabase.rpc('approve_practice', { lead_id: lead.id });

        if (error) {
            alert(`Provisioning Error: ${error.message}`);
        } else {
            alert(`Practice ${lead.practice_name} has been successfully provisioned. Organization ID: ${data.org_id}`);
            fetchLeads();
        }
        setProcessingId(null);
    };

    if (loading) return <div className="h-48 flex items-center justify-center text-muted-foreground animate-pulse">Scanning Onboarding Queue...</div>;

    const pendingLeads = leads.filter(l => l.status === 'PENDING');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <UserCheck className="w-6 h-6 text-primary mr-3" />
                        Practice Onboarding Queue
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 tracking-tight italic">
                        "Verify NPI and Practice credentials before provisioning new Vaults."
                    </p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">{pendingLeads.length} Requests Pending</span>
                </div>
            </div>

            {pendingLeads.length === 0 ? (
                <div className="glass-panel p-20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white/60 uppercase tracking-tighter">Queue Empty</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">There are no new practice onboarding requests at this time.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingLeads.map(lead => (
                        <div key={lead.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0 relative group">
                            <div className="flex items-start space-x-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-primary transition-colors">{lead.practice_name}</h4>
                                    <div className="flex items-center space-x-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                                        <span className="flex items-center"><ShieldAlert className="w-3 h-3 mr-1 text-yellow-500/60" /> NPI: {lead.npi_number}</span>
                                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {lead.admin_email}</span>
                                    </div>
                                    <p className="text-[11px] text-white/40 mt-1">Requested by: <span className="text-white/60 font-bold">{lead.full_name}</span> • {new Date(lead.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => handleApprove(lead)}
                                    disabled={processingId === lead.id}
                                    className={`px-6 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all ${processingId === lead.id ? 'opacity-50 animate-pulse' : 'hover:scale-105 active:scale-95'}`}
                                >
                                    {processingId === lead.id ? 'PROVISIONING...' : 'Approve & Provision'}
                                </button>
                                <button className="p-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                                    <UserX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Historical Log Section */}
            <div className="mt-12 space-y-4 opacity-40 hover:opacity-100 transition-opacity">
                 <h3 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-[0.3em]">Recent Provisions</h3>
                 <div className="space-y-2">
                    {leads.filter(l => l.status === 'APPROVED').slice(0, 3).map(lead => (
                        <div key={lead.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                             <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                </div>
                                <span className="font-bold text-white/80">{lead.practice_name}</span>
                             </div>
                             <span className="text-[10px] text-muted-foreground uppercase">Provisioned {new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default ApprovalsView;
