export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      assignments: {
        include: { teacher: { select: { id: true, name: true, email: true, role: true } } }
      }
    }
  });

  const assignees = await prisma.user.findMany({
    where: { 
      role: { in: ["TEACHER", "DEPARTMENT"] }, 
      isActive: true 
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' }
  });

  return <MaterialsClient initialMaterials={materials} activeAssignees={assignees} />;
}
