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

  const [teacher, activityTimeline] = await Promise.all([
    prisma.user.findUnique({
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
        },
        activities: {
          select: { actionType: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    // 30 kunlik faoliyat timeline
    prisma.materialActivity.findMany({
      where: {
        teacherId: teacherId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { actionType: true, createdAt: true },
    }),
  ]);

  if (!teacher) notFound();

  // Umumiy statistika
  const totalViews = teacher.activities.filter(a => a.actionType === "VIEW").length;
  const totalDownloads = teacher.activities.filter(a => a.actionType === "DOWNLOAD").length;

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

  const materials = teacher.assignedMaterials.map(a => a.material);

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
