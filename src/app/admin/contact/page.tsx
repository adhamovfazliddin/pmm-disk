"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { getSuperAdminContact, updateAdminContact } from "@/app/actions/contact";
import { toast } from "sonner";
import { Phone, Send, Save, Loader2, Plus, Trash2, User } from "lucide-react";

interface SupportContact {
  name: string;
  phone: string;
  telegram: string;
}

export default function AdminContactPage() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<SupportContact[]>([{ name: "", phone: "", telegram: "" }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getSuperAdminContact();
      if (data) {
        if (data.supportContacts && Array.isArray(data.supportContacts) && data.supportContacts.length > 0) {
          setContacts(data.supportContacts as SupportContact[]);
        } else if (data.phone || data.telegram) {
          // Fallback old data to the new format
          setContacts([{ name: "Tizim Ma'muri", phone: data.phone || "", telegram: data.telegram || "" }]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Yuborishdan oldin faqat biror narsa kiritilgan qatorlarni olamiz
    const filteredContacts = contacts.filter(c => c.name.trim() !== "" || c.phone.trim() !== "" || c.telegram.trim() !== "");
    
    const result = await updateAdminContact({ 
      supportContacts: filteredContacts.length > 0 ? filteredContacts : []
    });
    
    if (result.success) {
      toast.success(t('contactSavedInfo'));
      if (filteredContacts.length === 0) {
        setContacts([{ name: "", phone: "", telegram: "" }]); // Reset if empty
      } else {
        setContacts(filteredContacts);
      }
    } else {
      toast.error(result.error || "Xatolik yuz berdi");
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {t('contact')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('contactAdminDesc')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Bog'lanish ma'lumotlari</h2>
              <button 
                type="button" 
                onClick={() => setContacts([...contacts, { name: "", phone: "", telegram: "" }])}
                className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Yangi ma'mur qo'shish
              </button>
            </div>
            
            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={`contact-${index}`} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex flex-col gap-4">
                    {/* Yuqori qator: F.I.Sh va O'chirish tugmasi */}
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          F.I.Sh (Mas'ul shaxs)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => {
                              const newContacts = [...contacts];
                              newContacts[index].name = e.target.value;
                              setContacts(newContacts);
                            }}
                            placeholder="Masalan: Adxamov Fazliddin"
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                          />
                        </div>
                      </div>
                      
                      {contacts.length > 1 && (
                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={() => setContacts(contacts.filter((_, i) => i !== index))}
                            className="p-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
                            title="O'chirish"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pastki qator: Telefon va Telegram (Yonma-yon) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Telefon */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('phoneNumber')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => {
                              const newContacts = [...contacts];
                              newContacts[index].phone = e.target.value;
                              setContacts(newContacts);
                            }}
                            placeholder={t('phoneNumberPlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                          />
                        </div>
                      </div>

                      {/* Telegram */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('telegramUsername')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Send className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            value={contact.telegram}
                            onChange={(e) => {
                              const newContacts = [...contacts];
                              newContacts[index].telegram = e.target.value;
                              setContacts(newContacts);
                            }}
                            placeholder={t('telegramUsernamePlaceholder')}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {t('saveContactInfo')}
          </button>
        </form>
      </div>
    </div>
  );
}