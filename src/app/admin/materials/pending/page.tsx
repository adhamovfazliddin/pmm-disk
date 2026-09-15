import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PendingMaterialsClient from "./PendingMaterialsClient";

export const dynamic = "force-dynamic";

export default async function PendingMaterialsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    redirect("/admin");
  }

  const materials = await prisma.material.findMany({
    where: {
      status: "PENDING"
    },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true,
          department: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kutilayotgan materiallar</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          O'qituvchilar va Kafedralar tomonidan yuklangan, lekin hali tasdiqlanmagan materiallar ro'yxati.
        </p>
      </div>
      
      <PendingMaterialsClient initialMaterials={materials} />
    </div>
  );
}
