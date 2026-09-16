export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string; email: string } | null;
  
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, description: true, driveFolderId: true, departmentId: true, role: true, department: { select: { driveFolderId: true, name: true } } }
  });

  if (!user) {
    redirect("/login");
  }

  const currentTeacherId = String(session.userId);
  const currentDepartmentId = user.role === 'DEPARTMENT'
    ? String(session.userId)
    : (user.departmentId ? String(user.departmentId) : null);

  // ✅ Parallel so'rovlar — 3x tezroq
  const [materials, dbResources, dbBookmarks, personalResources] = await Promise.all([
    prisma.material.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { visibility: "GLOBAL" },
          { assignments: { some: { teacherId: session.userId } } },
          ...(user.departmentId ? [{ assignments: { some: { teacherId: user.departmentId } } }] : [])
        ]
      },
      orderBy: { createdAt: "asc" },
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
        assignments: { select: { teacherId: true } }
      }
    }),
    prisma.resource.findMany({
      where: {
        OR: [
          { visibility: "GLOBAL" },
          {
            visibility: "RESTRICTED",
            OR: [
              { teachers: { some: { id: currentTeacherId } } },
              ...(currentDepartmentId ? [{ departments: { some: { id: currentDepartmentId } } }] : [])
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        url: true,
        category: true,
        visibility: true,
        createdAt: true,
        departments: { select: { id: true } },
        teachers: { select: { id: true } }
      },
      orderBy: { createdAt: "asc" }
    }).catch(() => []),
    prisma.bookmark.findMany({
      where: { userId: currentTeacherId },
      select: { itemId: true }
    }).catch(() => []),
    prisma.personalResource.findMany({
      where: { ownerId: session.userId },
      orderBy: { createdAt: "asc" }
    }).catch(() => [])
  ]);

  const globalResources = dbResources.map((res: any) => ({
    ...res,
    departmentIds: res.departments.map((d: { id: string }) => d.id),
    teacherIds: res.teachers.map((t: { id: string }) => t.id)
  }));

  const initialBookmarks = dbBookmarks.map(b => b.itemId);

  // Shaxsiy statistika hisoblash (O'ziga tegishli yoki yaratgan materiallar uchun)
  let uploaderIds = [session.userId];
  if (user.role === 'DEPARTMENT') {
    const deptTeachers = await prisma.user.findMany({
      where: { departmentId: session.userId },
      select: { id: true }
    });
    uploaderIds = [...uploaderIds, ...deptTeachers.map(t => t.id)];
  }

  const myMaterials = await prisma.material.findMany({
    where: {
      uploadedById: { in: uploaderIds },
      status: "APPROVED"
    },
    select: { id: true }
  });
  
  const personalMaterialsIds = myMaterials.map(m => m.id);

  let totalViews = 0;
  let totalDownloads = 0;

  if (personalMaterialsIds.length > 0) {
    const activityStats = await prisma.materialActivity.groupBy({
      by: ['actionType'],
      where: {
        materialId: { in: personalMaterialsIds }
      },
      _count: { _all: true }
    });

    activityStats.forEach(stat => {
      if (stat.actionType === 'VIEW') totalViews = stat._count._all;
      if (stat.actionType === 'DOWNLOAD') totalDownloads = stat._count._all;
    });
  }

  const personalStats = {
    materials: personalMaterialsIds.length,
    views: totalViews,
    downloads: totalDownloads
  };

  return (
    <DashboardClient 
      initialMaterials={materials} 
      sessionName={user.name} 
      role={user.role}
      departmentName={user.department?.name}
      description={user.description} 
      driveFolderId={user.driveFolderId || user.department?.driveFolderId} 
      initialGlobalResources={globalResources}
      initialBookmarks={initialBookmarks}
      personalStats={personalStats}
      initialPersonalResources={personalResources}
    />
  );
}


