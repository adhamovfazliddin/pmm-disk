"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, Grid, Building, Library, PlusSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function MobileBottomNav({ role, pendingCount = 0 }: { role: string, pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const superAdminLinks = [
    { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/teachers", icon: Users, label: t("teachers") },
    { href: "/admin/departments", icon: Building, label: "Kafedralar" },
    { href: "/admin/materials", icon: FileText, label: t("materials") },
    { href: "/admin/materials/pending", icon: FileText, label: "Kutilayotganlar", badge: pendingCount },
    { href: "/admin/settings", icon: Settings, label: t("settings") },
  ];

  const teacherLinks = [
    { href: "/dashboard", icon: Grid, label: t("catalog") },
    { href: "/dashboard/materials/new", icon: PlusSquare, label: "Qo'shish" },
    { href: "/dashboard/my-materials", icon: Library, label: "Mening" },
    { href: "/dashboard/contact", icon: Users, label: t("contactTitle") },
  ];

  const links = role === "SUPERADMIN" ? superAdminLinks : (role === "TEACHER" || role === "DEPARTMENT" ? teacherLinks : []);

  if (!links || links.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0D131F]/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/70 transition-colors">
      <div className="flex justify-around items-center h-16 pb-safe">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "scale-110 transition-transform" : ""}`} />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm min-w-[16px] text-center">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate max-w-[70px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
