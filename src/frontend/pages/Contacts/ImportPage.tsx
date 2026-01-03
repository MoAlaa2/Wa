
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { ImportJob } from '../../types';
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ImportPage = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState<ImportJob[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const data = await whatsappService.getImportHistory();
    setHistory(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      await whatsappService.importContacts(e.target.files[0]);
      setUploading(false);
      fetchHistory();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.contacts.importPage.title}</h1>
        <p className="text-gray-500 mt-1">{t.contacts.importPage.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Upload size={24}/></div>
            <h3 className="font-semibold text-lg">{t.contacts.import}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Upload a CSV file containing contact details. Ensure headers match: Name, Phone, Email.</p>
          
          <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-50 border-gray-300' : 'border-blue-200 hover:bg-blue-50'}`}>
            <input type="file" className="hidden" accept=".csv" onChange={handleUpload} disabled={uploading} />
            {uploading ? (
              <div className="flex flex-col items-center text-gray-500">
                <Loader2 className="animate-spin mb-2" size={24} />
                <span>{t.contacts.importPage.processing}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-blue-600">
                <FileText className="mb-2" size={32} />
                <span className="font-medium">{t.contacts.importPage.upload}</span>
              </div>
            )}
          </label>
        </div>

        {/* Export */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Download size={24}/></div>
            <h3 className="font-semibold text-lg">{t.contacts.export}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Download all your contacts and their associated data in CSV format.</p>
          
          <button className="w-full py-4 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Download size={20} />
            {t.contacts.export}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-medium text-gray-900">{t.contacts.importPage.history}</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {history.map(job => (
              <tr key={job.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.filename}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(job.startedAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{job.processed} / {job.total} records</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status === 'completed' ? <CheckCircle size={12} className="mr-1"/> : <AlertCircle size={12} className="mr-1"/>}
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPage;
