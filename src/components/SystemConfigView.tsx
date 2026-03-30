import React, { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw, AlertTriangle, Key, Zap, Info } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface ConfigItem {
    key: string;
    value: string;
    description: string;
}

const SystemConfigView: React.FC = () => {
    const [config, setConfig] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('platform_config')
            .select('*');

        if (error) {
            console.error("Config Fetch Error:", error);
            setMessage({ type: 'error', text: "Failed to load system configuration." });
        } else {
            setConfig(data || []);
        }
        setLoading(false);
    };

    const handleSave = async (key: string, value: string) => {
        setSaving(true);
        const { error } = await supabase
            .from('platform_config')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) {
            setMessage({ type: 'error', text: `Failed to update ${key}: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: `${key} updated successfully.` });
            fetchConfig();
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Shield className="w-6 h-6 text-primary mr-3" />
                        System Configuration Vault
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 tracking-tight italic text-slate-400">
                        "High-privileged access to global QuantRx revenue and security parameters."
                    </p>
                </div>
                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    Super Admin Mode
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <Info className="w-4 h-4 mr-3" />
                    <span className="text-xs font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid gap-6">
                {/* Revenue Parameters */}
                <section className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center space-x-2 text-primary">
                        <Zap className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Revenue Governance</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {config.filter(c => c.key.includes('fee') || c.key.includes('threshold')).map(item => (
                            <div key={item.key} className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">{item.key.replace(/_/g, ' ')}</label>
                                <div className="flex items-center space-x-4">
                                    <input 
                                        type="number" 
                                        defaultValue={item.value}
                                        disabled={saving}
                                        onBlur={(e) => handleSave(item.key, e.target.value)}
                                        className={`bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-xl font-mono font-bold text-white w-full focus:border-primary outline-none ${saving ? 'opacity-50 cursor-wait' : ''}`}
                                    />
                                    <span className="text-xl font-bold text-white/40">{item.key.includes('fee') ? '%' : '$'}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic leading-relaxed">"{item.description}"</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Parameters */}
                <section className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 bg-gradient-to-br from-red-500/5 to-transparent">
                    <div className="flex items-center space-x-2 text-red-400">
                        <Key className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">Identity Security (Vault Salt)</h3>
                    </div>
                    
                    {config.filter(c => c.key.includes('salt')).map(item => (
                        <div key={item.key} className="space-y-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-4">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-white">CRITICAL ACTION: Rotational Security Salt</p>
                                    <p className="text-[10px] text-red-200/60 leading-relaxed">
                                        Changing the salt will break all existing patient de-identification matches. 
                                        Requires a full re-hash of all practice databases. **DO NOT CHANGE IN PRODUCTION.**
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input 
                                    type="text" 
                                    readOnly
                                    value={item.value}
                                    className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-xs font-mono font-bold text-white/40 w-full outline-none"
                                />
                                <button 
                                    disabled
                                    className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase opacity-50 cursor-not-allowed"
                                >
                                    Rotate
                                </button>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Save className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Audit Log Active</p>
                            <p className="text-[10px] text-muted-foreground italic">All configuration changes are immutable and logged with your Super Admin ID.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemConfigView;
