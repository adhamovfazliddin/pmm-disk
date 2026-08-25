"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard, Users, FileText, Sun, Moon, Settings, Building } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "next-themes";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout({ children, role, email, name, department }: { children: ReactNode, role: string, email?: string, name?: string, department?: string }) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-transparent transition-colors">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white dark:bg-[#0D131F] border-r border-slate-200/80 shadow-sm dark:border-slate-800/80 flex-col hidden md:flex transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Image src="/logo.png" alt="ARCPE Logo" width={40} height={40} className="rounded-md object-contain" />
          <span className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight">{t('title')}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {role === "SUPERADMIN" && (
            <>
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {t('dashboard')}
              </Link>
              <Link href="/admin/teachers" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {t('teachers')}
              </Link>
              <Link href="/admin/materials" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {t('materials')}
              </Link>
              <Link href="/admin/departments" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                Kafedralar
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {t('settings')}
              </Link>

            </>
          )}
          {role === "TEACHER" && (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {t('catalog')}
              </Link>

            </>
          )}
        </nav>
        
        {/* Toggles & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setLanguage("UZ")} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${language === 'UZ' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                UZ
              </button>
              <button 
                onClick={() => setLanguage("RU")} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${language === 'RU' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                RU
              </button>
            </div>
            
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors mr-1"
                title="Toggle Theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-lg ${
              role === 'SUPERADMIN' 
                ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-amber-500/20 text-white font-bold' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20 text-white font-semibold'
            }`}>
              {name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={name || email || ""}>
                {name || email || "Foydalanuvchi"}
              </p>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${role === 'SUPERADMIN' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {role === 'SUPERADMIN' 
                  ? (language === 'RU' ? 'Супер Администратор' : 'Bosh Administrator')
                  : (department || (language === 'RU' ? 'Член кафедры / Учитель' : "Kafedra a'zosi / O'qituvchi"))
                }
              </p>
            </div>
            <form action={logout}>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer" title={t('logout')}>
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white dark:bg-[#0D131F] border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm p-4 flex justify-between items-center md:hidden transition-colors z-20">
           <div className="flex items-center gap-2">
             <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-md object-contain" />
             <span className="font-bold text-gray-800 dark:text-gray-100">ARCPE</span>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <button 
                  onClick={() => setLanguage("UZ")} 
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${language === 'UZ' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  UZ
                </button>
                <button 
                  onClick={() => setLanguage("RU")} 
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${language === 'RU' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  RU
                </button>
                
                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors mx-0.5"
                  >
                    {resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                )}
             </div>

             <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${
                  role === 'SUPERADMIN' 
                    ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold' 
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold'
               }`}>
                 {name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : 'U'}
               </div>
               <form action={logout}>
                 <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer" title={t('logout')}>
                   <LogOut className="w-4 h-4" />
                 </button>
               </form>
             </div>
           </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8 bg-transparent transition-colors">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav role={role} />
      </main>
    </div>
  );
}
