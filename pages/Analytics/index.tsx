
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { AnalyticsSummary, MessageTimelineData, CostBreakdown, CampaignHeatmapPoint } from '../../types';
import { Download, CheckCircle, AlertTriangle, Star, Activity } from 'lucide-react';

const AnalyticsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeline, setTimeline] = useState<MessageTimelineData[]>([]);
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [heatmap, setHeatmap] = useState<CampaignHeatmapPoint[]>([]);

  useEffect(() => {
    if (!type || !['messaging', 'notifications', 'bots'].includes(type)) {
      navigate('/analytics/messaging');
      return;
    }
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    const [sum, time, cost, heat] = await Promise.all([
      whatsappService.getAnalyticsSummary(),
      whatsappService.getTimelineData('7d'),
      whatsappService.getCostBreakdown(),
      whatsappService.getHeatmapData()
    ]);
    setSummary(sum);
    setTimeline(time);
    setCosts(cost);
    setHeatmap(heat);
    setLoading(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'messaging': return t.analytics.messaging;
      case 'notifications': return t.analytics.notifications;
      case 'bots': return t.analytics.bots;
      default: return t.common.analytics;
    }
  };

  if (loading) return <div className="text-center py-20">{t.common.loading}</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.analytics.desc}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          <Download size={16} /> {t.common.export}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t.analytics.metrics.volume}</h3>
              <div className="text-2xl font-bold mt-1">{summary.totalMessages}</div>
           </div>
           <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t.analytics.metrics.delivered}</h3>
              <div className="text-2xl font-bold mt-1 text-green-600">{summary.deliveredRate}%</div>
           </div>
           <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t.analytics.metrics.read}</h3>
              <div className="text-2xl font-bold mt-1 text-blue-600">{summary.readRate}%</div>
           </div>
           <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{t.analytics.cost.total}</h3>
              <div className="text-2xl font-bold mt-1 text-yellow-600">{summary.totalCost} {t.common.currencySar || 'SAR'}</div>
           </div>
        </div>
      )}

      {/* Render Charts/Visuals based on data presence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">{t.analytics.metrics.heatmap}</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
               {heatmap.length > 0 ? (
                 <div className="grid grid-cols-7 gap-1 w-full h-full p-2">
                    {heatmap.slice(0, 168).map((p, i) => (
                      <div key={i} className="rounded-sm" style={{ backgroundColor: `rgba(22, 163, 74, ${p.intensity/100})` }}></div>
                    ))}
                 </div>
               ) : (<div>No Data</div>)}
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">{t.analytics.cost.total}</h3>
            <div className="space-y-4">
               {costs.map((c, i) => (
                 <div key={i} className="flex justify-between items-center p-2 border-b last:border-0">
                    <span className="text-sm">{c.category}</span>
                    <span className="font-bold">{c.amount} {t.common.currencySar || 'SAR'}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
