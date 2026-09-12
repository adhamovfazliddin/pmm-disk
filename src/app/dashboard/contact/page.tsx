"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { getSuperAdminContact, SupportContact } from "@/app/actions/contact";
import { Phone, Send, Loader2, Building, ShieldCheck, User } from "lucide-react";

export default function DashboardContactPage() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getSuperAdminContact();
      
      if (data) {
        if (data.supportContacts && Array.isArray(data.supportContacts) && data.supportContacts.length > 0) {
          setContacts(data.supportContacts as SupportContact[]);
        } else if (data.phone || data.telegram) {
          // Fallback old structure to new structure
          setContacts([{ name: "Tizim Ma'muri", phone: data.phone || "", telegram: data.telegram || "" }]);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="px-4 md:px-6 lg:px-8 pt-2 md:pt-4 pb-8 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Aloqa Kartalari - YONMA-YON (GORIZONTAL) - TEPAGA CHIQARILDI */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tizim Ma'murlari</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contacts.map((contact, idx) => (
              <div key={`contact-${idx}`} className="bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-16"></div>
                <div className="px-6 pb-6 flex-1 flex flex-col">
                  <div className="-mt-8 mb-4 flex justify-between items-end">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-lg border border-slate-100 dark:border-slate-800">
                      <div className="w-full h-full bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {contact.name || "Tizim Ma'muri"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Texnik yordam va tizim bilan bog'liq masalalar bo'yicha mas'ul xodim
                  </p>

                  <div className="flex flex-col gap-3 mt-auto">
                    {contact.phone ? (
                      <a 
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4 group-hover:scale-110 transition-transform">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">{t('phoneNumber')}</p>
                          <p className="font-medium text-slate-900 dark:text-white truncate">{contact.phone}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 opacity-70">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-4">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">{t('phoneNumber')}</p>
                          <p className="text-sm font-medium text-slate-500 truncate">Kiritilmagan</p>
                        </div>
                      </div>
                    )}

                    {contact.telegram ? (
                      <a 
                        href={`https://t.me/${contact.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mr-4 group-hover:scale-110 transition-transform">
                          <Send className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">{t('writeTelegram')}</p>
                          <p className="font-medium text-slate-900 dark:text-white truncate">@{contact.telegram}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 opacity-70">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mr-4">
                          <Send className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 truncate">{t('writeTelegram')}</p>
                          <p className="text-sm font-medium text-slate-500 truncate">Kiritilmagan</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {contacts.length === 0 && (
            <div className="bg-white dark:bg-[#0D131F] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center justify-center h-64 mt-4">
              <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Bog'lanish ma'lumotlari yo'q</h3>
              <p className="text-slate-500 max-w-sm text-sm">Hozircha tizim ma'murlari tomonidan aloqa ma'lumotlari kiritilmagan.</p>
            </div>
          )}
        </div>

        {/* Qo'shimcha ma'lumot - PASTGA TUSHIRILDI */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-5 md:p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Qachon bog'lanish mumkin?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Tizimga kirishda xatolik yuz bersa (parol yo'qolishi va hk)
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Materiallarni yuklash yoki ko'rishda texnik muammo chiqsa
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Google Drive ulanishida xatolik bo'lsa
              </p>
            </div>
            <div className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Tizim ishlashi bo'yicha takliflar bo'lsa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}