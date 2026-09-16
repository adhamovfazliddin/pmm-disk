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
      createdAt: 'asc'
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      
      <PendingMaterialsClient initialMaterials={materials} />
    </div>
  );
}
