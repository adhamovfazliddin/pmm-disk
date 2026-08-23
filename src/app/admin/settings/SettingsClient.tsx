"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { updateAdminProfile } from "@/app/actions/auth";
import { toast } from "sonner";

export default function SettingsClient({ currentEmail }: { currentEmail: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{t('adminSettings')}</h1>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
            <input 
              type="email" 
              name="newEmail"
              defaultValue={currentEmail}
              className={`w-full border ${fieldErrors.newEmail ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none`} 
            />
            {fieldErrors.newEmail && <p className="text-red-500 text-xs mt-1">{fieldErrors.newEmail.join(", ")}</p>}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Xavfsizlik</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('currentPassword')} <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="password" 
                  name="currentPassword"
                  placeholder="Tasdiqlash uchun joriy parolni kiriting"
                  className={`w-full border ${fieldErrors.currentPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none`} 
                />
                {fieldErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.currentPassword.join(", ")}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('newPassword')}</label>
                <input 
                  type="password" 
                  name="newPassword"
                  className={`w-full border ${fieldErrors.newPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none`} 
                />
                {fieldErrors.newPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.newPassword.join(", ")}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('confirmPassword')}</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  className={`w-full border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none`} 
                />
                {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword.join(", ")}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {t('save')}...
                </span>
              ) : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
