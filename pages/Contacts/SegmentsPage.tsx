
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Filter, Plus } from 'lucide-react';

const SegmentsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contacts.segments.title}</h1>
          <p className="text-gray-500 mt-1">{t.contacts.segments.desc}</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 opacity-50 cursor-not-allowed">
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.contacts.createSegment}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Dynamic Segmentation Engine</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Create rules to automatically categorize contacts based on attributes, tags, and activity.
        </p>
        <div className="mt-6 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-bold uppercase">
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default SegmentsPage;
