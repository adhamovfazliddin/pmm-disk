"use client";

import { useActionState, useEffect, useState } from "react";
import { login } from "@/app/actions/auth";
import Image from "next/image";
import { Loader2, Sun, Moon, Mail, Lock, Eye, EyeOff, ShieldCheck, MonitorPlay, Globe, GraduationCap } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.24z"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M21.582 6.186a2.665 2.665 0 0 0-1.876-1.884C18.053 3.86 12 3.86 12 3.86s-6.053 0-7.706.442a2.665 2.665 0 0 0-1.876 1.884C2 7.848 2 12 2 12s0 4.152.418 5.814a2.665 2.665 0 0 0 1.876 1.884C5.947 20.14 12 20.14 12 20.14s6.053 0 7.706-.442a2.665 2.665 0 0 0 1.876-1.884C22 16.152 22 12 22 12s0-4.152-.418-5.814zM9.917 15.116V8.884L15.333 12l-5.416 3.116z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.968-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
  </svg>
);

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);
  const { t, language, setLanguage } = useLanguage();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen h-full w-full overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-200">
      
      {/* Left Branding Hero - Hidden on Mobile */}
      <div className="hidden lg:flex relative z-10 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-950 p-12 text-white rounded-r-[2.5rem] shadow-[15px_0_30px_-5px_rgba(0,0,0,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Ambient Glows */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-50"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-50"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="bg-white p-2.5 rounded-full shadow-xl border border-white/20 shrink-0 flex items-center justify-center w-20 h-20">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md leading-snug">
            {t('centerName')}
          </h1>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug mb-6 drop-shadow-md">
            Kelajak bunyodkorlari uchun zamonaviy o'qituvchi platformasi!
          </h2>
          <p className="text-lg text-blue-100/90 mb-10 leading-relaxed font-medium">
            Andijon viloyati pedagogik mahorat markazining yagona raqamli platformasi. Dars ishlanmalari, videodarslar va metodik tavsiyalarni o'z ichiga olgan ilg'or ta'lim tizimi.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-2xl transition-all text-white">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-400/30 shadow-inner shrink-0">
                <GraduationCap className="w-7 h-7 text-blue-300 drop-shadow-sm" />
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-lg text-white font-medium italic leading-relaxed drop-shadow-sm">
                  &ldquo;{t('quote')}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <a href="https://t.me/and_pm_metod_markaz" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all hover:scale-110 shadow-sm" title="Telegram">
              <TelegramIcon className="w-5 h-5" />
            </a>
            <a href="https://youtube.com/channel/UCZe9XNwqB58Xms1oBDMMNNA" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all hover:scale-110 shadow-sm" title="YouTube">
              <YoutubeIcon className="w-5 h-5" />
            </a>
            <a href="https://facebook.com/groups/957755739031872/?ref=share" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all hover:scale-110 shadow-sm" title="Facebook">
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/andijonpmm.uz?igsh=MXVnYTUzdDM0Y3VwcA==" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all hover:scale-110 shadow-sm" title="Instagram">
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a href="https://andijonpmm.uz/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl text-white transition-all hover:scale-110 shadow-sm" title="Website">
              <Globe className="w-5 h-5" />
            </a>
          </div>
          <div className="text-sm text-blue-200/60 font-medium">
            &copy; {new Date().getFullYear()} {t('centerName')}.
          </div>
        </div>
      </div>

      {/* Right Authentication Area */}
      <div className="relative flex flex-col justify-center items-center p-6 sm:p-12">
        {/* Background ambient spot for mobile/desktop right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-3xl bg-blue-500/5 dark:bg-blue-500/10 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        {/* Top Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <div className="flex items-center gap-1 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 p-1.5 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800/80">
            <button 
              type="button"
              onClick={() => setLanguage("UZ")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'UZ' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              UZ
            </button>
            <button 
              type="button"
              onClick={() => setLanguage("RU")} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === 'RU' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              RU
            </button>
          </div>
          
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-900/70 shadow-sm border border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Glassmorphism Auth Card */}
        <div className="w-full max-w-[440px] backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-gray-300/60 dark:shadow-black/50 rounded-3xl p-8 sm:p-10 relative z-10 overflow-hidden">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white dark:bg-[#1E293B]/60 p-2.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700/60">
              <Image src="/logo.png" alt="Logo" width={64} height={64} className="rounded-xl object-contain" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              {t('signInTitle')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Tizimga kirish uchun ma'lumotlaringizni kiriting
            </p>
          </div>

          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                {t('email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0B0F17]/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                {t('password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-[#0B0F17]/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all sm:text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none rounded-r-xl"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2 bg-red-50/80 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-100 dark:border-red-500/20 font-medium">
                <span className="flex-1">{state.error}</span>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-[0.98] transition-all duration-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-100" />
                    {language === 'UZ' ? 'Kirilmoqda...' : 'Вход...'}
                  </>
                ) : (
                  t('signInButton')
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
