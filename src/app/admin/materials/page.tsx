export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      assignments: {
        include: { teacher: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
    select: { id: true, name: true, email: true },
  });

  return <MaterialsClient initialMaterials={materials} activeTeachers={teachers} />;
}

