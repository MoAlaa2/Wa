import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Workflow } from 'lucide-react';

const FlowsPage = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.pages.flows.title}</h1>
        <p className="text-gray-500 mt-1">{t.pages.flows.desc}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Workflow size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">WhatsApp Flows</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Interface for creating structured messages and interactive data collection flows.
        </p>
      </div>
    </div>
  );
};

export default FlowsPage;