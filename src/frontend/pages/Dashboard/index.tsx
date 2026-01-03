
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { AnalyticsSummary, QueueStats, ProtectionConfig } from '../../types';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare,
  ArrowRight,
  Shield,
  Activity,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [protectionConfig, setProtectionConfig] = useState<ProtectionConfig | null>(null);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchQueueStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const sumData = await whatsappService.getAnalyticsSummary('7d');
    setSummary(sumData);
    setLoading(false);
  };

  const fetchQueueStats = async () => {
    const qData = await whatsappService.getQueueStats();
    const pData = await whatsappService.getProtectionConfig();
    setQueueStats(qData);
    setProtectionConfig(pData);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, link }: any) => (
    <div 
      onClick={() => navigate(link)}
      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
          <Icon size={20} />
        </div>
        <div className="text-gray-300 group-hover:text-gray-500 transition-colors">
           <ArrowRight size={16} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
      {trend && (
        <div className={`flex items-center text-xs font-medium mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {Math.abs(trend)}% {t.dashboard.trends.increase}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.dashboard.desc}</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      )}

      {!loading && summary && (
        <>
          {protectionConfig && queueStats && (
            <div className={`rounded-xl border p-4 flex items-center justify-between ${
              protectionConfig.healthStatus === 'HEALTHY' ? 'bg-green-50 border-green-200' :
              protectionConfig.healthStatus === 'WARNING' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  protectionConfig.healthStatus === 'HEALTHY' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700'
                }`}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {t.dashboard.protection.title}
                    {protectionConfig.warmUpMode && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{t.dashboard.protection.warmup}</span>}
                  </h3>
                  <div className="text-sm text-gray-600 flex gap-4 mt-1">
                    <span className="flex items-center gap-1"><Activity size={14}/> {t.dashboard.protection.queue}: {queueStats.pending}</span>
                    <span className="flex items-center gap-1"><Zap size={14}/> {t.dashboard.protection.rate}: {(queueStats.currentRate ?? 0).toFixed(1)}/sec</span>
                    {queueStats.pending > 0 && <span>{t.dashboard.protection.estTime}: {queueStats.estimatedCompletion || '0s'}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className={`font-bold ${
                  protectionConfig.healthStatus === 'HEALTHY' ? 'text-green-700' : 
                  protectionConfig.healthStatus === 'WARNING' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {protectionConfig.healthStatus}
                </div>
                <div className="text-xs text-gray-500">{t.dashboard.protection.health}</div>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title={t.dashboard.stats.totalMessages} 
              value={summary.totalMessages.toLocaleString()} 
              icon={MessageSquare} 
              color="blue"
              trend={summary.trends.messages}
              link="/analytics/messaging"
            />
            <StatCard 
              title={t.dashboard.stats.readRate} 
              value={`${summary.readRate}%`} 
              icon={CheckCircle} 
              color="green"
              trend={summary.trends.read}
              link="/analytics/messaging"
            />
            <StatCard 
              title={t.dashboard.stats.totalCost} 
              value={`$${summary.totalCost.toFixed(2)}`} 
              icon={DollarSign} 
              color="yellow"
              trend={-summary.trends.cost}
              link="/analytics/notifications" 
            />
            <StatCard 
              title={t.dashboard.stats.failedRate} 
              value={`${summary.failedRate}%`} 
              icon={AlertTriangle} 
              color="red"
              link="/analytics/messaging"
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
               <h3 className="font-bold text-gray-900 mb-4">{t.dashboard.system.title}</h3>
               <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="p-2 bg-green-200 text-green-700 rounded-full">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-green-800">{t.dashboard.system.operational}</div>
                    <div className="text-sm text-green-600">{t.dashboard.system.apiConnected} • {t.dashboard.system.webhooksActive}</div>
                  </div>
               </div>
             </div>
             
             <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
                <h3 className="font-bold text-gray-900 mb-2">{t.dashboard.quickAction.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{t.dashboard.quickAction.desc}</p>
                <button 
                  onClick={() => navigate('/analytics/messaging')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-colors"
                >
                  {t.dashboard.quickAction.btn}
                </button>
             </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
