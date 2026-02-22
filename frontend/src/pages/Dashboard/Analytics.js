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
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
    50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.5); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  
  @keyframes blob-move {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -30px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(30px, 10px) scale(1.05); }
  }
  
  .analytics-page-bg {
    position: relative;
    min-height: 100%;
  }
  
  .bg-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: blob-move 15s ease-in-out infinite;
    pointer-events: none;
  }
  
  .bg-blob-1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    top: -50px;
    right: -100px;
    animation-delay: 0s;
  }
  
  .bg-blob-2 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #8b5cf6, #a855f7);
    top: 40%;
    left: -80px;
    animation-delay: -5s;
  }
  
  .bg-blob-3 {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    bottom: 20%;
    right: -60px;
    animation-delay: -10s;
  }
  
  .stat-card-hero {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
  }
  
  .stat-card-hero:hover {
    box-shadow: 0 12px 48px rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
  }
  
  .compact-stat-card {
    background: linear-gradient(145deg, rgba(39, 39, 42, 0.8) 0%, rgba(24, 24, 27, 0.9) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }
  
  .compact-stat-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .compact-stat-card.red { border-left: 3px solid #f87171; }
  .compact-stat-card.green { border-left: 3px solid #4ade80; }
  .compact-stat-card.purple { border-left: 3px solid #a78bfa; }
  .compact-stat-card.amber { border-left: 3px solid #fbbf24; }
  
  .metric-card {
    background: linear-gradient(145deg, rgba(39, 39, 42, 0.9) 0%, rgba(24, 24, 27, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }
  
  .metric-card.green {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%);
    border-color: rgba(34, 197, 94, 0.3);
  }
  
  .metric-card.purple {
    background: linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(24, 24, 27, 0.95) 100%);
    border-color: rgba(168, 85, 247, 0.3);
  }
  
  .glassmorphism {
    background: linear-gradient(145deg, rgba(39, 39, 42, 0.7) 0%, rgba(24, 24, 27, 0.8) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
  }
  
  .number-highlight {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #60a5fa 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
  
  .ring-glow-green {
    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.5));
  }
  
  .ring-glow-purple {
    filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5));
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
  const HeroStat = ({ label, value, icon: Icon, subtitle, accentColor = 'amber' }) => (
    <div className="stat-card-hero rounded-2xl p-6 hover-lift" data-testid="hero-stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${accentColor}-400/20`}>
          <Icon className={`text-${accentColor}-400`} size={28} />
        </div>
        <Sparkles className="text-amber-400/50" size={20} />
      </div>
      <p className="text-zinc-400 text-sm font-medium mb-1">{label}</p>
      <h2 className="text-4xl md:text-5xl font-bold number-highlight mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h2>
      {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );

  // Compact stat card with icon
  const CompactStat = ({ label, value, icon: Icon, color, index }) => (
    <div 
      className={`compact-stat-card ${color} rounded-xl p-4 hover-lift cursor-default`}
      style={{ animationDelay: `${index * 100}ms` }}
      data-testid={`compact-stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-lg bg-${color}-400/20`}>
          <Icon className={`text-${color}-400`} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-400 text-xs font-medium truncate">{label}</p>
          <p className="text-white text-xl font-bold">
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
      <div className={`metric-card ${color} rounded-2xl p-6 hover-lift`} data-testid={`metric-ring-${label.toLowerCase().replace(/\s/g, '-')}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Circular Progress */}
          <div className={`relative flex-shrink-0 ring-glow-${color}`}>
            <svg width="120" height="120" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="rgba(63, 63, 70, 0.5)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
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
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold text-${color}-400`}>{value.toFixed(1)}%</span>
              <Icon className={`text-${color}-400/60 mt-1`} size={16} />
            </div>
          </div>

          {/* Text content */}
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
                {isGood ? `${target}%+ = ` : `${t('target')}: `}{isGood ? (color === 'green' ? 'jó teljesítmény' : 'erős hook') : `${target}%+`}
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
      <div className="space-y-8" data-testid="analytics-page">
        {/* Header with animated accent */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-amber-400" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {t('analytics')}
              </h1>
            </div>
            <p className="text-zinc-400 text-sm md:text-base pl-11">
              {t('analytics_subtitle')}
            </p>
          </div>
        </div>

        {overview && (
          <>
            {/* Bento Grid Layout for Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              
              {/* Engagement score - calculated metric */}
              <div className="glassmorphism rounded-xl p-4 hover-lift" data-testid="engagement-score">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-600/10">
                    <Sparkles className="text-amber-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-400 text-xs font-medium">Engagement</p>
                    <p className="text-white text-xl font-bold">
                      {((overview.total_likes + overview.total_comments) / Math.max(overview.total_views, 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics - Circular Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
          <div className="glassmorphism rounded-2xl overflow-hidden" data-testid="hook-performance-section">
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
          <div className="glassmorphism rounded-2xl overflow-hidden" data-testid="time-series-section">
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
          <div className="glassmorphism rounded-2xl p-12 text-center" data-testid="empty-state">
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
