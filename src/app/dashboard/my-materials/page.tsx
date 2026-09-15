import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MyMaterialsClient from "./MyMaterialsClient";

export const dynamic = "force-dynamic";

export default async function MyMaterialsPage() {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    redirect("/dashboard");
  }

  const materials = await prisma.material.findMany({
    where: {
      uploadedById: session.userId as string
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      description: true,
      format: true,
      driveFileId: true,
      status: true,
      rejectionReason: true,
      createdAt: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mening materiallarim</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Siz yuklagan materiallar holatini shu yerdan kuzatib borishingiz mumkin.
        </p>
      </div>
      
      <MyMaterialsClient initialMaterials={materials} />
    </div>
  );
}
