import React, { useState, useEffect } from 'react';
import { UserCheck, Building, Mail, ShieldAlert, CheckCircle } from 'lucide-react';
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
        
        const { error } = await supabase.rpc('approve_practice', { lead_id: lead.id });

        if (error) {
            alert(`Provisioning Error: ${error.message}`);
        } else {
            // Simulate invitation sent
            console.log(`[INVITE] Sending onboarding link to ${lead.admin_email}`);
            fetchLeads();
        }
        setProcessingId(null);
    };

    const handleResendInvite = (lead: OnboardingLead) => {
        const message = `Welcome to QuantRx! Your Vault for ${lead.practice_name} is ready. Please register your administrative account at https://quantrxhealth.com using this email (${lead.admin_email}) to claim your access.`;
        navigator.clipboard.writeText(message);
        alert(`Invitation link copied to clipboard for ${lead.admin_email}`);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center p-20">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">Decrypting Lead Queue...</span>
            </div>
        </div>
    );

    const pendingLeads = leads.filter(l => l.status === 'PENDING');
    const approvedLeads = leads.filter(l => l.status === 'APPROVED');

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-white/10 pb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <UserCheck className="w-8 h-8 text-primary mr-4" />
                        Practice Onboarding
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                        Institutional Access Control • Pending Requests: {pendingLeads.length}
                    </p>
                </div>
                <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                    <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-center">
                        <p className="text-[8px] text-primary uppercase font-bold">Total Lifts</p>
                        <p className="text-sm font-bold text-white">420+</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Pending Column (2/3) */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Pending Provisioning</h3>
                    </div>

                    {pendingLeads.length === 0 ? (
                        <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/10">
                            <CheckCircle className="w-12 h-12 text-white/5" />
                            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Queue Status: Clear</p>
                        </div>
                    ) : (
                        pendingLeads.map(lead => (
                            <div key={lead.id} className="relative group">
                                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative glass-panel p-8 rounded-3xl border border-white/10 hover:border-primary/40 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-6">
                                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                <Building className="w-7 h-7" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-white text-xl tracking-tight">{lead.practice_name}</h4>
                                                <div className="flex items-center space-x-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                                    <span className="flex items-center text-yellow-500/80">
                                                        <ShieldAlert className="w-3 h-3 mr-1.5" /> 
                                                        NPI: {lead.npi_number}
                                                        <a href={`https://npiregistry.cms.hhs.gov/registry-search/results?number=${lead.npi_number}`} target="_blank" rel="noreferrer" className="ml-2 text-white/40 hover:text-white transition-colors">Verify ↗</a>
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-3 mt-4">
                                                    <div className="px-2.5 py-1 bg-white/5 rounded-full flex items-center space-x-2 border border-white/5">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-[9px] text-white/60 font-bold">{lead.admin_email}</span>
                                                    </div>
                                                    <span className="text-[9px] text-white/20 italic">Request from {lead.full_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end space-y-3">
                                            <button
                                                onClick={() => handleApprove(lead)}
                                                disabled={processingId === lead.id}
                                                className="w-48 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_25px_rgba(57,255,20,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {processingId === lead.id ? 'ENCRYPTING...' : 'Approve & Provision'}
                                            </button>
                                            <button className="text-[9px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/5">
                                                Reject Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar History (1/3) */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Recent Provisions</h3>
                    <div className="space-y-3">
                        {approvedLeads.map(lead => (
                            <div key={lead.id} className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white tracking-tight">{lead.practice_name}</span>
                                            <span className="text-[8px] text-muted-foreground uppercase font-mono">{lead.npi_number}</span>
                                        </div>
                                    </div>
                                    <button 
                                      onClick={() => handleResendInvite(lead)}
                                      className="p-2 hover:bg-white/5 rounded-lg text-primary transition-all group" 
                                      title="Resend Invite"
                                    >
                                        <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Invitation Sent</span>
                                    <span className="text-[8px] text-white/40">{new Date(lead.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalsView;
