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
    select: { name: true, description: true, driveFolderId: true, departmentId: true, role: true, department: { select: { driveFolderId: true } } }
  });

  if (!user) {
    redirect("/login");
  }

  const currentTeacherId = String(session.userId);
  const currentDepartmentId = user.role === 'DEPARTMENT'
    ? String(session.userId)
    : (user.departmentId ? String(user.departmentId) : null);

  // ✅ Parallel so'rovlar — 3x tezroq
  const [materials, dbResources, dbBookmarks] = await Promise.all([
    prisma.material.findMany({
      where: {
        OR: [
          { visibility: "GLOBAL" },
          { assignments: { some: { teacherId: session.userId } } },
          ...(user.departmentId ? [{ assignments: { some: { teacherId: user.departmentId } } }] : [])
        ]
      },
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
      orderBy: { createdAt: "desc" }
    }).catch(() => []),
    prisma.bookmark.findMany({
      where: { userId: currentTeacherId },
      select: { itemId: true }
    }).catch(() => [])
  ]);

  const globalResources = dbResources.map((res: any) => ({
    ...res,
    departmentIds: res.departments.map((d: { id: string }) => d.id),
    teacherIds: res.teachers.map((t: { id: string }) => t.id)
  }));

  const initialBookmarks = dbBookmarks.map(b => b.itemId);

  return (
    <DashboardClient 
      initialMaterials={materials} 
      sessionName={user.name} 
      role={user.role}
      description={user.description} 
      driveFolderId={user.driveFolderId || user.department?.driveFolderId} 
      initialGlobalResources={globalResources}
      initialBookmarks={initialBookmarks}
    />
  );
}


