import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  UserPlus,
  Zap,
  Target,
  Sparkles,
  Activity
} from 'lucide-react';

export default function Analytics() {
  const { api } = useAuth();
  const { t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [hookPerformance, setHookPerformance] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, hookPerfRes, timeSeriesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/hook-performance'),
        api.get('/analytics/time-series?limit=10')
      ]);

      setOverview(overviewRes.data);
      setHookPerformance(hookPerfRes.data);
      setTimeSeries(timeSeriesRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <div className="text-amber-400 text-lg font-medium">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-b from-amber-500/5 via-purple-500/5 to-blue-500/5 -m-6 p-6 lg:-m-8 lg:p-8 min-h-screen" data-testid="analytics-page">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-500/30 to-orange-500/20 rounded-xl border border-amber-500/30">
          <Activity className="text-amber-400" size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Analytics Dashboard
          </h1>
          <p className="text-zinc-400 text-sm">
            Performance metrikák és insights
          </p>
        </div>
      </div>

      {overview && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Hero Card - Views */}
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-blue-600/10 border border-blue-500/40 rounded-2xl p-6 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/30 rounded-xl border border-blue-400/30">
                  <Eye className="text-blue-400" size={24} />
                </div>
                <Sparkles className="text-cyan-400/70" size={18} />
              </div>
              <p className="text-blue-300/80 text-sm font-medium mb-1">{t('total_views')}</p>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {(overview.total_views || 0).toLocaleString()}
              </h2>
            </div>

            {/* Likes Card */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/10 border-l-4 border-l-red-400 border border-red-500/20 rounded-xl p-4 hover:border-red-400/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/20 rounded-lg border border-red-400/30">
                  <Heart className="text-red-400" size={20} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-medium">{t('total_likes')}</p>
                  <p className="text-red-100 text-xl font-bold">{(overview.total_likes || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Engagement Card */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-l-4 border-l-amber-400 border border-amber-500/20 rounded-xl p-4 hover:border-amber-400/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-lg border border-amber-400/30">
                  <Sparkles className="text-amber-400" size={20} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-medium">Engagement</p>
                  <p className="text-amber-100 text-xl font-bold">
                    {((overview.total_likes + overview.total_comments) / Math.max(overview.total_views, 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Subscribers Card */}
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 border-l-4 border-l-purple-400 border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 rounded-lg border border-purple-400/30">
                  <UserPlus className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-medium">{t('new_subscribers')}</p>
                  <p className="text-purple-100 text-xl font-bold">{(overview.total_subs || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Comments Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-l-4 border-l-green-400 border border-green-500/20 rounded-xl p-4 hover:border-green-400/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/20 rounded-lg border border-green-400/30">
                  <MessageCircle className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-zinc-400 text-xs font-medium">{t('total_comments')}</p>
                  <p className="text-green-100 text-xl font-bold">{(overview.total_comments || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Retention & Swipe Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Retention Rate */}
            <div className="bg-gradient-to-br from-green-600/25 via-emerald-500/15 to-green-600/5 border border-green-500/40 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                {/* Circle Progress */}
                <div className="relative mb-4">
                  <svg width="140" height="140" className="transform -rotate-90">
                    <circle
                      cx="70" cy="70" r="55"
                      stroke="rgba(34, 197, 94, 0.2)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="70" cy="70" r="55"
                      stroke="url(#greenGrad)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 55}`}
                      strokeDashoffset={`${2 * Math.PI * 55 * (1 - Math.min(overview.avg_retention || 0, 100) / 100)}`}
                      className="drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    />
                    <defs>
                      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-400">{(overview.avg_retention || 0).toFixed(1)}%</span>
                    <Target className="text-green-400/60 mt-1" size={18} />
                  </div>
                </div>
                
                <h3 className="text-green-400 font-semibold text-lg flex items-center gap-2 mb-1">
                  <Target size={18} />
                  {t('avg_retention_rate')}
                </h3>
                <p className="text-zinc-400 text-sm mb-3">Script effectiveness (3-30s nézettség)</p>
                <div className="flex items-center gap-2">
                  <Badge className={`${(overview.avg_retention || 0) >= 60 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} border`}>
                    {(overview.avg_retention || 0) >= 60 ? t('excellent') : t('improvable')}
                  </Badge>
                  <span className="text-xs text-zinc-500">target: 60%+</span>
                </div>
              </div>
            </div>

            {/* Swipe Rate */}
            <div className="bg-gradient-to-br from-purple-600/25 via-violet-500/15 to-purple-600/5 border border-purple-500/40 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                {/* Circle Progress */}
                <div className="relative mb-4">
                  <svg width="140" height="140" className="transform -rotate-90">
                    <circle
                      cx="70" cy="70" r="55"
                      stroke="rgba(168, 85, 247, 0.2)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="70" cy="70" r="55"
                      stroke="url(#purpleGrad)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 55}`}
                      strokeDashoffset={`${2 * Math.PI * 55 * (1 - Math.min(overview.avg_swipe_rate || 0, 100) / 100)}`}
                      className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    />
                    <defs>
                      <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-purple-400">{(overview.avg_swipe_rate || 0).toFixed(1)}%</span>
                    <Zap className="text-purple-400/60 mt-1" size={18} />
                  </div>
                </div>
                
                <h3 className="text-purple-400 font-semibold text-lg flex items-center gap-2 mb-1">
                  <Zap size={18} />
                  {t('avg_swipe_rate')}
                </h3>
                <p className="text-zinc-400 text-sm mb-3">Hook effectiveness (0-3s megtartás)</p>
                <div className="flex items-center gap-2">
                  <Badge className={`${(overview.avg_swipe_rate || 0) >= 70 ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} border`}>
                    {(overview.avg_swipe_rate || 0) >= 70 ? t('excellent') : t('improvable')}
                  </Badge>
                  <span className="text-xs text-zinc-500">target: 70%+</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hook Performance */}
      {hookPerformance.length > 0 && (
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Zap className="text-amber-400" size={20} />
              {t('hook_type_performance')}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {hookPerformance.map((item, idx) => (
              <div 
                key={idx} 
                className="relative bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/70 transition-colors"
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500/20 to-transparent rounded-l-xl"
                  style={{ width: `${Math.min(item.avg_retention || 0, 100)}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">
                        {item.hook_type || 'Unknown'}
                      </Badge>
                      <span className="text-xs text-zinc-500">{item.count}× használva</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-zinc-500">{t('retention')}</p>
                        <p className="text-lg font-bold text-white">{(item.avg_retention || 0).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Views</p>
                        <p className="text-lg font-bold text-white">{(item.total_views || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-zinc-700/50">
                    {(item.avg_retention || 0) >= 50 ? (
                      <TrendingUp className="text-green-400" size={20} />
                    ) : (
                      <TrendingDown className="text-red-400" size={20} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Series */}
      {timeSeries.length > 0 && (
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Activity className="text-blue-400" size={20} />
              {t('latest_metrics')}
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {timeSeries.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center justify-between">
                <span className="text-zinc-400 text-sm">
                  {new Date(item.created_at).toLocaleDateString('hu-HU', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-400" />
                    <span className="text-white text-sm font-medium">{item.views}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart size={14} className="text-red-400" />
                    <span className="text-white text-sm font-medium">{item.likes}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                    {(item.retention_percent || 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!overview && (
        <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 mb-6">
            <TrendingUp className="text-zinc-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {t('no_analytics_yet')}
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            {t('upload_csv_or_add_metrics')}
          </p>
        </div>
      )}
    </div>
  );
}
