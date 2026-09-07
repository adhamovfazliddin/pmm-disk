export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const [materials, assignees] = await Promise.all([
    prisma.material.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        format: true,
        driveFileId: true,
        visibility: true,
        createdAt: true,
        createdBy: { select: { name: true } },
        assignments: {
          select: {
            id: true,
            teacherId: true,
            teacher: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    }),
    prisma.user.findMany({
      where: { 
        role: { in: ["TEACHER", "DEPARTMENT"] }, 
        isActive: true 
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return <MaterialsClient initialMaterials={materials} activeAssignees={assignees} />;
}
