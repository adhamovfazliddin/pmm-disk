export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import TeacherDetailClient from "./TeacherDetailClient";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/login");

  const resolvedParams = await params;
  const teacherId = resolvedParams.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId, role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      description: true,
      driveFolderId: true,
      createdAt: true,
      lastLoginAt: true,
      department: { select: { id: true, name: true } },
      assignedMaterials: {
        select: {
          material: {
            select: {
              id: true,
              title: true,
              subject: true,
              format: true,
              visibility: true,
              createdAt: true,
            }
          }
        },
        orderBy: { material: { createdAt: "desc" } },
        take: 20,
      }
    },
  });

  if (!teacher) notFound();

  // Dashboard bilan bir xil mantiq: GLOBAL + biriktirilgan materiallar
  const allMaterials = await prisma.material.findMany({
    where: {
      OR: [
        { visibility: "GLOBAL" },
        { assignments: { some: { teacherId: teacherId } } },
        ...(teacher.department?.id ? [{ assignments: { some: { teacherId: teacher.department.id } } }] : [])
      ]
    },
    select: {
      id: true,
      title: true,
      subject: true,
      format: true,
      visibility: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const materials = allMaterials;
  const materialIds = materials.map(m => m.id);

  let totalViews = 0;
  let totalDownloads = 0;
  let activityTimeline: { actionType: "VIEW" | "DOWNLOAD", createdAt: Date }[] = [];

  if (materialIds.length > 0) {
    const activityStats = await prisma.materialActivity.groupBy({
      by: ['actionType'],
      where: { materialId: { in: materialIds } },
      _count: { _all: true }
    });

    activityStats.forEach(stat => {
      if (stat.actionType === 'VIEW') totalViews = stat._count._all;
      if (stat.actionType === 'DOWNLOAD') totalDownloads = stat._count._all;
    });

    activityTimeline = await prisma.materialActivity.findMany({
      where: {
        materialId: { in: materialIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { actionType: true, createdAt: true },
    });
  }

  // 30 kunlik timeline hisoblash
  const timelineMap = new Map<string, { name: string; views: number; downloads: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    timelineMap.set(dateStr, { name: dateStr, views: 0, downloads: 0 });
  }
  activityTimeline.forEach(a => {
    const dateStr = a.createdAt.toISOString().split("T")[0];
    if (timelineMap.has(dateStr)) {
      const item = timelineMap.get(dateStr)!;
      if (a.actionType === "VIEW") item.views += 1;
      if (a.actionType === "DOWNLOAD") item.downloads += 1;
    }
  });

  const timeline = Array.from(timelineMap.values()).reverse();



  return (
    <TeacherDetailClient
      teacher={{
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        isActive: teacher.isActive,
        description: teacher.description,
        driveFolderId: teacher.driveFolderId,
        createdAt: teacher.createdAt,
        lastLoginAt: teacher.lastLoginAt,
        department: teacher.department,
      }}
      stats={{ totalViews, totalDownloads, totalMaterials: materials.length }}
      timeline={timeline}
      materials={materials}
    />
  );
}
