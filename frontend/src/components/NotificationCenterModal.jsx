import React, { useState, useEffect } from 'react';
import { 
  X, Bell, AlertTriangle, CheckCircle, Mail, Send, 
  Clock, ShieldAlert, Sparkles, Filter, Volume2, VolumeX,
  ExternalLink, Compass, Wind, Gauge, Calendar, Radio
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function NotificationCenterModal({ isOpen, onClose, onSelectStorm }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'email'
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'digest'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Email Send State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedStormForEmail, setSelectedStormForEmail] = useState('remal');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState(null);
  const [sendErrorMessage, setSendErrorMessage] = useState(null);

  // Subscription State
  const [subEmail, setSubEmail] = useState('');
  const [subRealtime, setSubRealtime] = useState(true);
  const [subDaily, setSubDaily] = useState(true);
  const [subPasses, setSubPasses] = useState(false);
  const [subMinCategory, setSubMinCategory] = useState('SCS');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subSuccessMessage, setSubSuccessMessage] = useState(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/v1/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/notifications/mark-all-read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmailReport = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setSendErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSendingEmail(true);
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    try {
      const stormPayloads = {
        remal: {
          storm_name: 'CYCLONE REMAL',
          category: 'Severe Cyclonic Storm (SCS)',
          msw_knots: 65.0,
          pressure_hpa: 978.0,
          lat: 21.95,
          lon: 89.20,
          landfall_location: 'Sagar Island / Khepupara Coast',
          landfall_eta: '18 Hours (26-May-2024 18:00 UTC)'
        },
        fani: {
          storm_name: 'CYCLONE FANI',
          category: 'Super Cyclonic Storm (SuCS)',
          msw_knots: 115.0,
          pressure_hpa: 932.0,
          lat: 19.35,
          lon: 85.69,
          landfall_location: 'Puri Coast, Odisha',
          landfall_eta: 'Landfall Intersected (03-May-2019)'
        },
        amphan: {
          storm_name: 'CYCLONE AMPHAN',
          category: 'Super Cyclonic Storm (SuCS)',
          msw_knots: 140.0,
          pressure_hpa: 906.0,
          lat: 21.65,
          lon: 88.35,
          landfall_location: 'Bakkhali Coast, West Bengal',
          landfall_eta: 'Landfall Intersected (20-May-2020)'
        }
      };

      const stormData = stormPayloads[selectedStormForEmail] || stormPayloads.remal;

      const res = await fetch(`${API_BASE}/api/v1/notifications/send-report-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          storm_data: stormData
        })
      });

      const data = await res.json();
      if (data.status === 'DISPATCHED') {
        setSendSuccessMessage(`Official IMD/WMO Advisory PDF & Synoptic briefing dispatched to ${recipientEmail}!`);
        setRecipientEmail('');
      } else {
        setSendErrorMessage(data.message || 'Failed to dispatch email.');
      }
    } catch (err) {
      setSendErrorMessage('Network error during email dispatch.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail || !subEmail.includes('@')) {
      return;
    }
    setIsSubscribing(true);
    setSubSuccessMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: subEmail,
          frequency: 'daily',
          realtime_critical: subRealtime,
          daily_digest: subDaily,
          pass_updates: subPasses,
          min_category: subMinCategory
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setSubSuccessMessage(`Subscribed ${subEmail} to automated meteorological bulletins.`);
        setSubEmail('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'critical') return n.severity === 'CRITICAL' || n.severity === 'ADVISORY';
    if (filter === 'digest') return n.severity === 'DAILY_DIGEST';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[#64104E]/60 bg-[#0c0616]/95 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#64104E]/40 bg-[#140b22]/90">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-[#E04A31]/15 border border-[#E04A31]/40 text-[#E04A31]">
              <Bell className="w-5 h-5 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E04A31] text-[10px] font-bold text-white shadow-lg">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Meteorological Early Warning & Alerts
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#64104E]/50 text-[#C3864D] border border-[#64104E]">
                  INSAT & NOAA Stream
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time rapid intensification triggers, landfall proximity alerts & automated email bulletins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                soundEnabled 
                  ? 'border-[#B43067]/40 bg-[#B43067]/15 text-[#E04A31]' 
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500'
              }`}
              title={soundEnabled ? "Audio Alarms Enabled" : "Audio Alarms Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0e071a] border-b border-[#64104E]/30 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-[#E04A31] to-[#B43067] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Basin Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
                activeTab === 'email'
                  ? 'bg-gradient-to-r from-[#E04A31] to-[#B43067] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Reports & Subscriptions</span>
            </button>
          </div>

          {activeTab === 'feed' && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-400 hover:text-[#E04A31] transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'feed' ? (
            <div>
              {/* Filter Pills */}
              <div className="flex items-center gap-2 mb-4 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-bold">
                  <Filter className="w-3 h-3 text-[#E04A31]" /> Filter:
                </span>
                {[
                  { id: 'all', label: 'All Alerts' },
                  { id: 'critical', label: 'Landfall & Rapid Intensification' },
                  { id: 'digest', label: 'Daily Synoptic Digests' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFilter(p.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filter === p.id
                        ? 'bg-[#64104E] text-white font-bold border border-[#B43067]'
                        : 'bg-zinc-900 text-slate-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Alerts List */}
              <div className="space-y-3">
                {filteredNotifs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No notifications matching this filter.
                  </div>
                ) : (
                  filteredNotifs.map(item => {
                    const isCritical = item.severity === 'CRITICAL';
                    const isDigest = item.severity === 'DAILY_DIGEST';
                    const isAdvisory = item.severity === 'ADVISORY';

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all ${
                          !item.is_read
                            ? 'bg-[#180d28] border-[#B43067]/60 shadow-[0_0_20px_rgba(180,48,103,0.12)]'
                            : 'bg-[#10071c]/70 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Severity Badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isCritical 
                                  ? 'bg-[#E04A31]/20 text-[#E04A31] border border-[#E04A31]/50' 
                                  : isDigest
                                  ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                                  : isAdvisory
                                  ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                                  : 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50'
                              }`}>
                                {item.severity.replace('_', ' ')}
                              </span>

                              {/* Category Pill */}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-slate-200 border border-zinc-700">
                                {item.category_badge}
                              </span>

                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {item.timestamp_utc}
                              </span>

                              {!item.is_read && (
                                <span className="inline-block w-2 h-2 rounded-full bg-[#E04A31] animate-ping" />
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-white">
                              {item.title}
                            </h3>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {item.message}
                            </p>

                            {/* Telemetry Snapshot Strip */}
                            <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Wind className="w-3.5 h-3.5 text-[#E04A31]" />
                                <strong className="text-white">{item.msw_knots} kts</strong> MSW
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Gauge className="w-3.5 h-3.5 text-[#B43067]" />
                                <strong className="text-white">{item.pressure_hpa} hPa</strong>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 text-amber-400" />
                                Landfall: <strong className="text-slate-200">{item.landfall_eta}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Quick Action */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {onSelectStorm && (
                              <button
                                onClick={() => {
                                  handleMarkAsRead(item.id);
                                  onSelectStorm(item.storm_id);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E04A31]/20 hover:bg-[#E04A31] text-[#E04A31] hover:text-white border border-[#E04A31]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                              >
                                <span>{item.action_label}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}

                            {!item.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(item.id)}
                                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Email Dispatch & Daily Subscription Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: On-Demand Instant Report Dispatch */}
              <div className="p-5 rounded-xl border border-[#64104E]/50 bg-[#12091e] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#E04A31]/20 border border-[#E04A31]/50 text-[#E04A31]">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Instant Advisory Dispatch</h3>
                    <p className="text-[11px] text-slate-400">Email official publication-quality PDF bulletin</p>
                  </div>
                </div>

                <form onSubmit={handleSendEmailReport} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-bold">Select Active Cyclone:</label>
                    <select
                      value={selectedStormForEmail}
                      onChange={(e) => setSelectedStormForEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a0f28] border border-[#64104E]/60 text-white font-mono focus:outline-none focus:border-[#E04A31]"
                    >
                      <option value="remal">Cyclone Remal (Severe Cyclonic Storm - 65 kts)</option>
                      <option value="fani">Cyclone Fani (Super Cyclonic Storm - 115 kts)</option>
                      <option value="amphan">Cyclone Amphan (Super Cyclonic Storm - 140 kts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-bold">Recipient Email Address:</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="disaster.ops@state.gov.in"
                      className="w-full px-3 py-2 rounded-lg bg-[#1a0f28] border border-[#64104E]/60 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#E04A31]"
                      required
                    />
                  </div>

                  {sendSuccessMessage && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{sendSuccessMessage}</span>
                    </div>
                  )}

                  {sendErrorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600 text-rose-300 text-[11px]">
                      {sendErrorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#E04A31] to-[#B43067] hover:brightness-110 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Generating & Dispatching PDF...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Official PDF Bulletin Now</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    * Attaches an IMD/WMO standard high-fidelity PDF with thermodynamic core grading, quadrant wind radii, and landfall waypoints.
                  </p>
                </form>
              </div>

              {/* Box 2: Automated Daily Subscriptions */}
              <div className="p-5 rounded-xl border border-[#64104E]/50 bg-[#12091e] space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Automated Alert Subscriptions</h3>
                    <p className="text-[11px] text-slate-400">Receive morning synoptic digests & triggers</p>
                  </div>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-bold">Subscriber Email:</label>
                    <input
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="chief.forecaster@imd.gov.in"
                      className="w-full px-3 py-2 rounded-lg bg-[#1a0f28] border border-[#64104E]/60 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#E04A31]"
                      required
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subRealtime}
                        onChange={(e) => setSubRealtime(e.target.checked)}
                        className="rounded border-zinc-700 text-[#E04A31] focus:ring-0"
                      />
                      <span className="text-slate-300">
                        ⚡ <strong>Real-Time Critical Landfall & RI Alerts</strong>
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subDaily}
                        onChange={(e) => setSubDaily(e.target.checked)}
                        className="rounded border-zinc-700 text-[#E04A31] focus:ring-0"
                      />
                      <span className="text-slate-300">
                        🌅 <strong>Daily Morning Synoptic Digest (08:00 UTC)</strong>
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subPasses}
                        onChange={(e) => setSubPasses(e.target.checked)}
                        className="rounded border-zinc-700 text-[#E04A31] focus:ring-0"
                      />
                      <span className="text-slate-300">
                        🛰️ <strong>6-Hourly Satellite Pass Telemetry Sync</strong>
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Minimum Alert Severity:</label>
                    <select
                      value={subMinCategory}
                      onChange={(e) => setSubMinCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#1a0f28] border border-zinc-700 text-slate-200 font-mono text-[11px]"
                    >
                      <option value="CS">Cyclonic Storm (CS) & Above (&gt;34 kts)</option>
                      <option value="SCS">Severe Cyclonic Storm (SCS) & Above (&gt;48 kts)</option>
                      <option value="VSCS">Very Severe Cyclonic Storm (VSCS) (&gt;64 kts)</option>
                    </select>
                  </div>

                  {subSuccessMessage && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-[11px] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{subSuccessMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#64104E] hover:bg-[#851668] text-white font-bold transition-all flex items-center justify-center gap-2 border border-[#B43067]/60 shadow cursor-pointer"
                  >
                    {isSubscribing ? (
                      <span>Saving Preferences...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Save Subscription Preferences</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
