import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import NewMaterialClient from "./NewMaterialClient";

export const dynamic = "force-dynamic";

export default async function NewMaterialPage() {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yangi material qo'shish</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          O'zingiz yaratgan uslubiy qullanma yoki qo'llanmalarni platformaga yuklang. Sizning materialingiz Admin tomonidan tasdiqlangandan so'ng, sizning katalogingizda paydo bo'ladi.
        </p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <NewMaterialClient />
      </div>
    </div>
  );
}
