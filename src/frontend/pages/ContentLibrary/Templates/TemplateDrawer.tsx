
import React from 'react';
import { X, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Template } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface TemplateDrawerProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({ template, isOpen, onClose }) => {
  const { t, dir } = useLanguage();

  if (!template) return null;

  const headerComponent = template.components.find(c => c.type === 'HEADER');
  const bodyComponent = template.components.find(c => c.type === 'BODY');
  const footerComponent = template.components.find(c => c.type === 'FOOTER');
  const buttonsComponent = template.components.find(c => c.type === 'BUTTONS');

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      
      <div className={`fixed inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} max-w-full flex`}>
        <div className={`w-screen max-w-md transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : (dir === 'rtl' ? '-translate-x-full' : 'translate-x-full')} bg-white shadow-xl flex flex-col`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">{t.templates.drawer.details}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Status Section */}
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                  ${template.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                    template.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {t.templates.status[template.status]}
                </span>
                <span className="text-gray-400 text-sm flex items-center">
                  <Clock size={14} className="mr-1 rtl:mr-0 rtl:ml-1" />
                  {new Date(template.lastUpdated).toLocaleDateString()}
                </span>
              </div>

              {template.status === 'REJECTED' && template.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3 rtl:ml-0 rtl:mr-3">
                      <h3 className="text-sm font-medium text-red-800">{t.templates.drawer.rejectionReason}</h3>
                      <div className="mt-2 text-sm text-red-700">
                        {template.rejectionReason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t.templates.drawer.preview}</h3>
              <div className="bg-[#E5DDD5] p-4 rounded-lg border border-gray-200 bg-opacity-50">
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] relative">
                  {/* Header */}
                  {headerComponent && (
                    <div className="mb-2 pb-2 border-b border-gray-100 font-semibold text-gray-800">
                      {headerComponent.format === 'IMAGE' ? (
                        <div className="h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 mb-2">
                           {t.common.image}
                        </div>
                      ) : headerComponent.text}
                    </div>
                  )}
                  
                  {/* Body */}
                  <div className="text-gray-800 text-sm whitespace-pre-wrap">
                    {bodyComponent?.text}
                  </div>

                  {/* Footer */}
                  {footerComponent && (
                    <div className="mt-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
                      {footerComponent.text}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-[10px] text-gray-400 text-right mt-1">
                    12:30 PM
                  </div>
                </div>

                {/* Buttons */}
                {buttonsComponent && buttonsComponent.buttons && (
                   <div className="mt-2 space-y-2 max-w-[85%]">
                     {buttonsComponent.buttons.map((btn, idx) => (
                       <div key={idx} className="bg-white rounded-lg p-2 text-center text-blue-500 font-medium text-sm shadow-sm cursor-pointer hover:bg-gray-50">
                         {btn.text}
                       </div>
                     ))}
                   </div>
                )}
              </div>
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div>
                <label className="text-xs text-gray-500 uppercase">{t.templates.table.category}</label>
                <p className="text-sm font-medium text-gray-900">{template.category}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">{t.templates.table.language}</label>
                <p className="text-sm font-medium text-gray-900">{template.language}</p>
              </div>
            </div>

            {/* Variables Extraction */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t.templates.drawer.variables}</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {bodyComponent?.text?.match(/{{[0-9]+}}/g) ? (
                  bodyComponent.text.match(/{{[0-9]+}}/g)?.map((variable, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">{variable}</span>
                      <span className="text-gray-400">{t.templates.drawer.variablePrefix} {idx + 1}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">{t.templates.drawer.noVariables}</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
