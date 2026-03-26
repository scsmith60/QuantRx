import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';


export interface Notification {
    id: string;
    type: 'clinical' | 'financial' | 'system';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface NotificationsPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ 
    isOpen, 
    onClose, 
    notifications, 
    onMarkAsRead,
    onClearAll 
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for click-away */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-12 w-80 bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center">
                                <Bell className="w-3 h-3 mr-2 text-primary" />
                                Intelligence Alerts
                            </h3>
                            <button 
                                onClick={onClearAll}
                                className="text-[9px] font-bold text-muted-foreground hover:text-white uppercase transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center space-y-2">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">All Clear</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div 
                                        key={n.id}
                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors group relative ${!n.isRead ? 'bg-primary/5' : ''}`}
                                        onClick={() => onMarkAsRead(n.id)}
                                    >
                                        <div className="flex space-x-3">
                                            <div className={`mt-0.5 p-1 rounded-md shrink-0 ${
                                                n.type === 'clinical' ? 'bg-[#39FF14]/20 text-[#39FF14]' :
                                                n.type === 'financial' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {n.type === 'clinical' ? <Zap size={12} /> :
                                                 n.type === 'financial' ? <AlertTriangle size={12} /> :
                                                 <Info size={12} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-bold text-white leading-none">{n.title}</p>
                                                    <span className="text-[8px] text-muted-foreground font-mono">{n.timestamp}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-white/5 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">
                                Secure FHIR Bridge v2.4
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationsPopover;
