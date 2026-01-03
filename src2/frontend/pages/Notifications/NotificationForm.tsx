
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { whatsappService } from '../../services/whatsappService';
import { NotificationCampaign, Template } from '../../types';
import { ChevronRight, ChevronLeft, Save, Send, Settings, Users, FileText, Info } from 'lucide-react';

const STEPS = ['basic', 'template', 'recipients', 'advanced'];

const NotificationForm = () => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<NotificationCampaign>>({
    title: '',
    type: 'BROADCAST',
    status: 'DRAFT',
    stats: { total: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
    retryEnabled: false,
    throttling: 0,
    emailReport: false
  });

  useEffect(() => {
    const init = async () => {
       const tmpls = await whatsappService.getTemplates();
       setTemplates(tmpls.filter(t => t.status === 'APPROVED'));

       if (id) {
         const existing = await whatsappService.getCampaign(id);
         if (existing) setFormData(existing);
       }
    };
    init();
  }, [id]);

  const handleSave = async (launch: boolean = false) => {
    setLoading(true);
    const campaignToSave = {
      ...formData,
      status: launch ? 'RUNNING' : 'DRAFT',
      stats: { ...formData.stats, total: 1000 } // Mock total contacts
    } as NotificationCampaign;

    await whatsappService.saveCampaign(campaignToSave);
    setLoading(false);
    navigate('/notifications');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
            ${index <= currentStep ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 text-gray-400'}
            font-bold text-sm transition-colors`}
          >
            {index + 1}
          </div>
          {index < STEPS.length - 1 && (
            <div className={`w-16 h-1 mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{id ? t.common.edit : t.notificationsPage.create}</h1>
        <p className="text-gray-500">{t.notificationsPage.wizard.steps[STEPS[currentStep] as keyof typeof t.notificationsPage.wizard.steps]}</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[400px]">
        
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-6 max-w-lg mx-auto">
             <div className="text-center mb-8">
               <Info size={48} className="mx-auto text-blue-500 mb-2" />
               <h3 className="text-lg font-medium">{t.notificationsPage.wizard.steps.basic}</h3>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t.notificationsPage.wizard.basic.labelTitle}</label>
               <input 
                 type="text" 
                 value={formData.title} 
                 onChange={e => setFormData({...formData, title: e.target.value})}
                 className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                 placeholder={t.notificationsPage.wizard.basic.placeholderTitle}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">{t.notificationsPage.wizard.basic.labelType}</label>
               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setFormData({...formData, type: 'BROADCAST'})}
                   className={`p-4 border rounded-xl text-center transition-all ${formData.type === 'BROADCAST' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}
                 >
                   <div className="font-bold">{t.notificationsPage.wizard.basic.types.broadcast}</div>
                   <div className="text-xs mt-1 opacity-70">Marketing & Promo</div>
                 </button>
                 <button 
                   onClick={() => setFormData({...formData, type: 'TRANSACTIONAL'})}
                   className={`p-4 border rounded-xl text-center transition-all ${formData.type === 'TRANSACTIONAL' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}
                 >
                   <div className="font-bold">{t.notificationsPage.wizard.basic.types.transactional}</div>
                   <div className="text-xs mt-1 opacity-70">OTP & Alerts</div>
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Step 2: Template */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2"><FileText size={18}/> {t.notificationsPage.wizard.template.select}</h3>
               <div className="space-y-3">
                 {templates.map(tmpl => (
                   <div 
                     key={tmpl.id}
                     onClick={() => setFormData({...formData, templateId: tmpl.id, templateName: tmpl.name})}
                     className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.templateId === tmpl.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                   >
                     <div className="font-medium text-sm">{tmpl.name}</div>
                     <div className="text-xs text-gray-500">{tmpl.category} • {tmpl.language}</div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Preview */}
             <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-xs">
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.notificationsPage.wizard.template.preview}</h4>
                   {formData.templateId ? (
                      <div className="text-sm text-gray-800">
                        {templates.find(t => t.id === formData.templateId)?.components.find(c => c.type === 'BODY')?.text}
                      </div>
                   ) : (
                     <div className="text-sm text-gray-400 italic text-center py-4">Select a template to preview</div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Step 3: Recipients */}
        {currentStep === 2 && (
          <div className="max-w-lg mx-auto text-center space-y-6">
             <div className="mb-8">
               <Users size={48} className="mx-auto text-purple-500 mb-2" />
               <h3 className="text-lg font-medium">{t.notificationsPage.wizard.steps.recipients}</h3>
             </div>

             <div className="space-y-4 text-left">
               <label className="block p-4 border rounded-xl cursor-pointer hover:bg-gray-50 border-gray-200">
                  <input type="radio" name="list" className="mr-3" defaultChecked />
                  <span className="font-medium">All Contacts (5,200)</span>
               </label>
               <label className="block p-4 border rounded-xl cursor-pointer hover:bg-gray-50 border-gray-200">
                  <input type="radio" name="list" className="mr-3" />
                  <span className="font-medium">VIP Customers (120)</span>
               </label>
               <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 opacity-60">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">{t.notificationsPage.wizard.recipients.smartSegments}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{t.notificationsPage.wizard.recipients.comingSoon}</span>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* Step 4: Advanced */}
        {currentStep === 3 && (
           <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center mb-8">
               <Settings size={48} className="mx-auto text-gray-500 mb-2" />
               <h3 className="text-lg font-medium">{t.notificationsPage.wizard.steps.advanced}</h3>
             </div>

             <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">{t.notificationsPage.wizard.advanced.retry}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.retryEnabled} 
                    onChange={e => setFormData({...formData, retryEnabled: e.target.checked})}
                    className="h-5 w-5 text-green-600 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">{t.notificationsPage.wizard.advanced.emailReport}</span>
                  <input 
                    type="checkbox" 
                    checked={formData.emailReport} 
                    onChange={e => setFormData({...formData, emailReport: e.target.checked})}
                    className="h-5 w-5 text-green-600 rounded"
                  />
                </label>

                <div>
                   <span className="block text-sm font-medium text-gray-700 mb-1">{t.notificationsPage.wizard.advanced.throttling}</span>
                   <input 
                     type="number" 
                     value={formData.throttling}
                     onChange={e => setFormData({...formData, throttling: parseInt(e.target.value)})}
                     className="w-full border border-gray-300 rounded-lg p-2"
                   />
                </div>
             </div>
           </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          onClick={() => currentStep > 0 ? setCurrentStep(curr => curr - 1) : navigate('/notifications')}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center"
        >
          {currentStep > 0 ? <ChevronLeft size={18} className="mr-2 rtl:ml-2 rtl:mr-0"/> : null}
          {currentStep > 0 ? t.notificationsPage.wizard.actions.back : t.common.cancel}
        </button>

        <div className="flex gap-3">
          {currentStep === STEPS.length - 1 && (
            <button 
              onClick={() => handleSave(false)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center"
            >
              <Save size={18} className="mr-2 rtl:ml-2 rtl:mr-0"/>
              {t.notificationsPage.wizard.actions.saveDraft}
            </button>
          )}

          <button 
            onClick={() => {
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(curr => curr + 1);
              } else {
                handleSave(true);
              }
            }}
            className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 flex items-center shadow-lg shadow-green-200"
          >
            {currentStep < STEPS.length - 1 ? (
               <>
                 {t.notificationsPage.wizard.actions.next}
                 <ChevronRight size={18} className="ml-2 rtl:mr-2 rtl:ml-0"/>
               </>
            ) : (
               <>
                 <Send size={18} className="mr-2 rtl:ml-2 rtl:mr-0"/>
                 {t.notificationsPage.wizard.actions.saveSend}
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationForm;
