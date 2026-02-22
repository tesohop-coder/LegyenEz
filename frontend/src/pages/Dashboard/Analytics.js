import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

// CSS for animations
const styles = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.8; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  .analytics-wrapper {
    position: relative;
    overflow: hidden;
  }
  
  .gradient-bg-top {
    position: absolute;
    top: -150px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(249, 115, 22, 0.15) 40%, transparent 70%);
    pointer-events: none;
    animation: pulse-soft 8s ease-in-out infinite;
  }
  
  .gradient-bg-left {
    position: absolute;
    top: 30%;
    left: -150px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%);
    pointer-events: none;
    animation: pulse-soft 10s ease-in-out infinite;
    animation-delay: -3s;
  }
  
  .gradient-bg-bottom {
    position: absolute;
    bottom: 5%;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 40%, transparent 70%);
    pointer-events: none;
    animation: pulse-soft 12s ease-in-out infinite;
    animation-delay: -6s;
  }
  
  .hero-card {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(59, 130, 246, 0.05) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
  }
  
  .hero-card:hover {
    box-shadow: 0 12px 48px rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  .stat-card {
    background: linear-gradient(145deg, rgba(39, 39, 42, 0.9) 0%, rgba(24, 24, 27, 0.95) 100%);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .stat-card-red { border-left: 3px solid #f87171; background: linear-gradient(135deg, rgba(248, 113, 113, 0.08) 0%, rgba(24, 24, 27, 0.95) 100%); }
  .stat-card-green { border-left: 3px solid #4ade80; background: linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(24, 24, 27, 0.95) 100%); }
  .stat-card-purple { border-left: 3px solid #a78bfa; background: linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(24, 24, 27, 0.95) 100%); }
  .stat-card-amber { border-left: 3px solid #fbbf24; background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(24, 24, 27, 0.95) 100%); }
  
  .metric-section-green {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.12) 0%, rgba(24, 24, 27, 0.95) 100%);
    border: 1px solid rgba(34, 197, 94, 0.25);
    box-shadow: 0 4px 24px rgba(34, 197, 94, 0.1);
  }
  
  .metric-section-purple {
    background: linear-gradient(145deg, rgba(168, 85, 247, 0.12) 0%, rgba(24, 24, 27, 0.95) 100%);
    border: 1px solid rgba(168, 85, 247, 0.25);
    box-shadow: 0 4px 24px rgba(168, 85, 247, 0.1);
  }
  
  .glass-panel {
    background: linear-gradient(145deg, rgba(39, 39, 42, 0.7) 0%, rgba(24, 24, 27, 0.8) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
  }
  
  .number-glow {
    background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #60a5fa 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
    text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
  }
  
  .ring-glow-green {
    filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.4));
  }
  
  .ring-glow-purple {
    filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.4));
  }
`;

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

  // Main hero stat with large display
  const HeroStat = ({ label, value, icon: Icon, subtitle }) => (
    <div className="hero-card rounded-2xl p-6 hover-lift" data-testid="hero-stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-blue-500/25 border border-blue-400/20">
          <Icon className="text-blue-400" size={28} />
        </div>
        <Sparkles className="text-cyan-400/60" size={20} />
      </div>
      <p className="text-blue-200/70 text-sm font-medium mb-1">{label}</p>
      <h2 className="text-4xl md:text-5xl font-bold number-glow mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h2>
      {subtitle && <p className="text-xs text-blue-300/50">{subtitle}</p>}
    </div>
  );

  // Compact stat card with colored accent
  const CompactStat = ({ label, value, icon: Icon, color, index }) => (
    <div 
      className={`stat-card stat-card-${color} rounded-xl p-4 hover-lift cursor-default`}
      data-testid={`compact-stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-lg bg-${color}-400/15 border border-${color}-400/20`}>
          <Icon className={`text-${color}-400`} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-400 text-xs font-medium truncate">{label}</p>
          <p className={`text-${color}-100 text-xl font-bold`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );

  // Circular progress ring for percentages
  const MetricRing = ({ value, label, description, color, target, Icon }) => {
    const percentage = Math.min(value, 100);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const isGood = value >= target;

    return (
      <div className={`metric-section-${color} rounded-2xl p-6 hover-lift`} data-testid={`metric-ring-${label.toLowerCase().replace(/\s/g, '-')}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Circular Progress */}
          <div className={`relative flex-shrink-0 ring-glow-${color}`}>
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="rgba(63, 63, 70, 0.4)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke={`url(#gradient-${color})`}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color === 'green' ? '#4ade80' : '#c4b5fd'} />
                  <stop offset="100%" stopColor={color === 'green' ? '#22c55e' : '#8b5cf6'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold text-${color}-400`}>{value.toFixed(1)}%</span>
              <Icon className={`text-${color}-400/60 mt-1`} size={16} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className={`text-${color}-400 font-semibold text-lg mb-1 flex items-center justify-center md:justify-start gap-2`}>
              <Icon size={18} />
              {label}
            </h3>
            <p className="text-zinc-400 text-sm mb-3">{description}</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Badge className={isGood ? `bg-${color}-400/20 text-${color}-400 border border-${color}-400/30` : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'}>
                {isGood ? t('excellent') : t('improvable')}
              </Badge>
              <span className="text-xs text-zinc-500">
                target: {target}%+
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="analytics-wrapper space-y-8" data-testid="analytics-page">
        {/* Background gradients */}
        <div className="gradient-bg-top" />
        <div className="gradient-bg-left" />
        <div className="gradient-bg-bottom" />
        
        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-amber-400/25 to-orange-500/15 rounded-xl border border-amber-400/20">
              <Activity className="text-amber-400" size={26} />
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
        </div>

        {overview && (
          <>
            {/* Bento Grid Layout for Stats */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Hero stat - spans 2 columns on mobile */}
              <div className="col-span-2">
                <HeroStat
                  label={t('total_views')}
                  value={overview.total_views || 0}
                  icon={Eye}
                  subtitle="Összes megtekintés"
                  accentColor="blue"
                />
              </div>
              
              {/* Compact stats */}
              <CompactStat
                label={t('total_likes')}
                value={overview.total_likes || 0}
                icon={Heart}
                color="red"
                index={0}
              />
              <CompactStat
                label={t('total_comments')}
                value={overview.total_comments || 0}
                icon={MessageCircle}
                color="green"
                index={1}
              />
              <CompactStat
                label={t('new_subscribers')}
                value={overview.total_subs || 0}
                icon={UserPlus}
                color="purple"
                index={2}
              />
              
              {/* Engagement score */}
              <div className="stat-card stat-card-amber rounded-xl p-4 hover-lift" data-testid="engagement-score">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-amber-400/15 border border-amber-400/20">
                    <Sparkles className="text-amber-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-400 text-xs font-medium">Engagement</p>
                    <p className="text-amber-100 text-xl font-bold">
                      {((overview.total_likes + overview.total_comments) / Math.max(overview.total_views, 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics - Circular Progress */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <MetricRing
                value={overview.avg_retention || 0}
                label={t('avg_retention_rate')}
                description="Script effectiveness (3-30s nézettség)"
                color="green"
                target={60}
                Icon={Target}
              />
              <MetricRing
                value={overview.avg_swipe_rate || 0}
                label={t('avg_swipe_rate')}
                description="Hook effectiveness (0-3s megtartás)"
                color="purple"
                target={70}
                Icon={Zap}
              />
            </div>
          </>
        )}

        {/* Hook Type Performance */}
        {hookPerformance.length > 0 && (
          <div className="relative z-10 glassmorphism rounded-2xl overflow-hidden" data-testid="hook-performance-section">
            <div className="p-4 md:p-6 border-b border-white/5">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Zap className="text-amber-400" size={20} />
                {t('hook_type_performance')}
              </h3>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              {hookPerformance.map((item, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-xl bg-zinc-800/30 p-4 hover-lift group"
                  data-testid={`hook-item-${idx}`}
                >
                  {/* Background progress bar */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400/10 to-transparent transition-all duration-500"
                    style={{ width: `${Math.min(item.avg_retention || 0, 100)}%` }}
                  />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Badge className="bg-amber-400/20 text-amber-400 text-xs font-semibold">
                          {item.hook_type || 'Unknown'}
                        </Badge>
                        <span className="text-xs text-zinc-500">{item.count}× használva</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-zinc-500">{t('retention')}</p>
                          <p className="text-lg font-bold text-white">{item.avg_retention?.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Views</p>
                          <p className="text-lg font-bold text-white">{item.total_views?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trend indicator */}
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

        {/* Time Series - Modern list */}
        {timeSeries.length > 0 && (
          <div className="relative z-10 glassmorphism rounded-2xl overflow-hidden" data-testid="time-series-section">
            <div className="p-4 md:p-6 border-b border-white/5">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Activity className="text-blue-400" size={20} />
                {t('latest_metrics')}
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {timeSeries.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between"
                  data-testid={`time-series-item-${idx}`}
                >
                  <span className="text-zinc-400 text-sm">
                    {new Date(item.created_at).toLocaleDateString('hu-HU', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1.5">
                      <Eye size={14} className="text-blue-400" />
                      <span className="text-white text-sm font-medium">{item.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={14} className="text-red-400" />
                      <span className="text-white text-sm font-medium">{item.likes}</span>
                    </div>
                    <Badge className="bg-green-400/10 text-green-400 text-xs">
                      {item.retention_percent?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!overview && (
          <div className="relative z-10 glassmorphism rounded-2xl p-12 text-center" data-testid="empty-state">
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
    </>
  );
}
