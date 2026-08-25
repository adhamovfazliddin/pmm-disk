"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { updateAdminProfile } from "@/app/actions/auth";
import { toast } from "sonner";
import { Mail, Lock, Shield, Save, User, Eye, EyeOff } from "lucide-react";

export default function SettingsClient({ currentEmail }: { currentEmail: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateAdminProfile(null, formData);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else if (result.success) {
        toast.success(t('profileUpdated'));
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      toast.error("Server xatosi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{t('adminSettings')}</h1>
        <p className="text-slate-500 dark:text-slate-400">Shaxsiy ma'lumotlar va xavfsizlik sozlamalarini boshqarish</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Card */}
        <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Akkaunt ma'lumotlari</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="newEmail"
                  defaultValue={currentEmail}
                  className={`w-full pl-10 pr-4 py-2.5 border ${fieldErrors.newEmail ? 'border-red-500' : 'border-slate-300 dark:border-slate-700/60'} bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`} 
                />
              </div>
              {fieldErrors.newEmail && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.newEmail.join(", ")}</p>}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Xavfsizlik</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('currentPassword')} <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input 
                  required
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Tasdiqlash uchun joriy parolni kiriting"
                  className={`w-full pl-10 pr-10 py-2.5 border ${fieldErrors.currentPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700/60'} bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`} 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.currentPassword && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.currentPassword.join(", ")}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('newPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Yangi parolni kiriting"
                    className={`w-full pl-10 pr-10 py-2.5 border ${fieldErrors.newPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700/60'} bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.newPassword && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.newPassword.join(", ")}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Yangi parolni takrorlang"
                    className={`w-full pl-10 pr-10 py-2.5 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700/60'} bg-slate-50/50 dark:bg-[#1E293B]/60 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.confirmPassword.join(", ")}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{t('save')}...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t('save')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
