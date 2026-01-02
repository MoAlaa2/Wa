
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { AnalyticsSummary, MessageTimelineData, CostBreakdown, ErrorLog, AgentPerformance, CampaignHeatmapPoint } from '../../types';
import { 
  BarChart2, 
  PieChart, 
  Activity, 
  Download, 
  Calendar,
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Star
} from 'lucide-react';

const AnalyticsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  
  // Data States
  const [timeline, setTimeline] = useState<MessageTimelineData[]>([]);
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [heatmap, setHeatmap] = useState<CampaignHeatmapPoint[]>([]);

  useEffect(() => {
    // Default to messaging if type is invalid or missing
    if (!type || !['messaging', 'notifications', 'bots'].includes(type)) {
      navigate('/analytics/messaging');
      return;
    }
    fetchData();
  }, [type, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    // In a real app, we would fetch different endpoints based on `type`
    // For now we reuse the service methods but display them contextually
    const [timeData, costData, errData, heatData] = await Promise.all([
      whatsappService.getTimelineData(dateRange),
      whatsappService.getCostBreakdown(),
      whatsappService.getErrorLogs(),
      whatsappService.getHeatmapData()
    ]);
    setTimeline(timeData);
    setCosts(costData);
    setErrors(errData);
    setHeatmap(heatData);
    setLoading(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'messaging': return 'Messaging Analytics';
      case 'notifications': return 'Notification Analytics';
      case 'bots': return 'Bot Session Analytics';
      default: return 'Analytics';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into your performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Report...</p>
        </div>
      ) : (
        <>
          {type === 'messaging' && (
            <>
              {/* Feedback Summary (Mock) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Star size={18} className="text-yellow-500 fill-current" />
                    Customer Satisfaction
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">4.8 <span className="text-sm font-normal text-gray-500">/ 5</span></p>
                  <p className="text-xs text-green-600 mt-1">+0.2 vs last week</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Feedback Response Rate</h3>
                  <p className="text-3xl font-bold text-gray-900">32%</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Top Agent Rating</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">SA</div>
                    <div>
                      <p className="font-bold">Sarah Support</p>
                      <p className="text-xs text-gray-500">4.9 Avg (120 reviews)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Message Volume</h3>
                  <div className="h-[300px] flex items-end gap-2 justify-between">
                     {timeline.map((item, idx) => (
                       <div key={idx} className="flex-1 flex flex-col items-center group relative">
                          <div className="w-full bg-blue-100 rounded-t hover:bg-blue-200 transition-colors relative" style={{ height: `${(item.sent / 6000) * 100}%` }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                              {item.sent} sent
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-2">{item.date}</div>
                       </div>
                     ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Delivery & Read Rates</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-green-600" />
                          <span className="font-medium text-gray-700">Delivered</span>
                        </div>
                        <span className="text-xl font-bold text-green-700">98.2%</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-blue-600" />
                          <span className="font-medium text-gray-700">Read</span>
                        </div>
                        <span className="text-xl font-bold text-blue-700">84.5%</span>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="text-red-600" />
                          <span className="font-medium text-gray-700">Failed</span>
                        </div>
                        <span className="text-xl font-bold text-red-700">1.8%</span>
                     </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'notifications' && (
            <div className="grid grid-cols-1 gap-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Campaign Performance Heatmap</h3>
                 <div className="grid grid-cols-[auto_1fr] gap-2">
                    <div className="flex flex-col justify-between text-xs text-gray-400 pr-2 py-1">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>
                    <div className="grid grid-cols-24 gap-1">
                      {heatmap.map((point, i) => (
                        <div 
                          key={i}
                          className="w-full h-6 rounded-sm hover:opacity-80 transition-opacity relative group"
                          style={{ 
                            backgroundColor: `rgba(22, 163, 74, ${point.intensity / 100})`,
                            opacity: point.intensity ? 1 : 0.1 
                          }}
                        >
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                            {point.day} {point.hour}:00 - Intensity: {point.intensity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2 pl-8">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
                  </div>
               </div>
               
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Cost Analysis</h3>
                 <div className="space-y-4">
                    {costs.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{item.category}</span>
                          <span className="text-gray-900 font-bold">${item.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${(item.percentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {type === 'bots' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Total Sessions</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">12,450</p>
                  <p className="text-sm text-gray-500 mt-1">+15% from last week</p>
               </div>
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Completion Rate</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">78.4%</p>
                  <p className="text-sm text-gray-500 mt-1">Users reaching end node</p>
               </div>
               
               <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Most Triggered Flows</h3>
                  <div className="space-y-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                             <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{i}</span>
                             <span className="font-medium text-gray-800">Flow Name {i}</span>
                          </div>
                          <span className="text-sm font-mono text-gray-600">{1000 - i * 50} hits</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
