import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import DepartmentDetailClient from "./DepartmentDetailClient";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") redirect("/login");

  const resolvedParams = await params;
  const departmentId = resolvedParams.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [department, recentAssignments, teachersList, distinctAssignments] = await Promise.all([
    // Kafedra ma'lumotlari
    prisma.user.findUnique({
      where: { id: departmentId, role: "DEPARTMENT" },
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
        _count: {
          select: { teachers: true }
        }
      }
    }),
    
    // Materiallar (Eng so'nggi 20 ta biriktirilgan)
    prisma.materialAssignment.findMany({
      where: {
        OR: [
          { teacherId: departmentId },
          { teacher: { departmentId: departmentId } }
        ]
      },
      select: {
        material: {
          select: {
            id: true,
            title: true,
            subject: true,
            format: true,
            visibility: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        material: { createdAt: "desc" }
      },
      take: 50 // Retrieve a bit more to ensure 20 unique
    }),

    // O'qituvchilar ro'yxati
    prisma.user.findMany({
      where: { departmentId: departmentId, role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      },
      orderBy: { name: "asc" }
    }),

    // Jami biriktirilgan noyob materiallar soni uchun
    prisma.materialAssignment.groupBy({
      by: ['materialId'],
      where: {
        OR: [
          { teacherId: departmentId },
          { teacher: { departmentId: departmentId } }
        ]
      }
    })
  ]);

  if (!department) {
    notFound();
  }

  // O'qituvchilarning ID-larini olish
  const teacherIds = teachersList.map(t => t.id);

  // Dashboard bilan bir xil mantiq: GLOBAL + kafedraga biriktirilgan materiallar
  const allMaterials = await prisma.material.findMany({
    where: {
      OR: [
        { visibility: "GLOBAL" },
        { assignments: { some: { teacherId: departmentId } } },
        ...(teacherIds.length > 0 ? [{ assignments: { some: { teacherId: { in: teacherIds } } } }] : [])
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

  const materialIds = allMaterials.map(m => m.id);

  let totalViews = 0;
  let totalDownloads = 0;
  let timelineActivities: { actionType: "VIEW" | "DOWNLOAD", createdAt: Date }[] = [];

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

    timelineActivities = await prisma.materialActivity.findMany({
      where: {
        materialId: { in: materialIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { actionType: true, createdAt: true },
    });
  }

  // Generate 30 days map
  const timelineMap = new Map<string, { date: string; view: number; download: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const shortDate = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    timelineMap.set(dateStr, { date: shortDate, view: 0, download: 0 });
  }

  timelineActivities.forEach(act => {
    const dateStr = act.createdAt.toISOString().split('T')[0];
    if (timelineMap.has(dateStr)) {
      const item = timelineMap.get(dateStr)!;
      if (act.actionType === "VIEW") {
        item.view++;
      } else if (act.actionType === "DOWNLOAD") {
        item.download++;
      }
    }
  });

  const chartData = Array.from(timelineMap.values());
  const formattedMaterials = allMaterials;

  const departmentData = {
    ...department,
    stats: {
      materials: allMaterials.length,
      views: totalViews,
      downloads: totalDownloads,
      teachersCount: department._count.teachers
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <DepartmentDetailClient 
        department={departmentData} 
        chartData={chartData} 
        materials={formattedMaterials}
        teachersList={teachersList}
      />
    </div>
  );
}
