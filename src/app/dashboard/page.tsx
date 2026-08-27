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
    select: { name: true, description: true, driveFolderId: true, departmentId: true, role: true }
  });

  if (!user) {
    redirect("/login");
  }

  const materials = await prisma.material.findMany({
    where: {
      OR: [
        { visibility: "GLOBAL" },
        { assignments: { some: { teacherId: session.userId } } },
        ...(user.departmentId ? [{ assignments: { some: { teacherId: user.departmentId } } }] : [])
      ]
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } }
    }
  });

  const currentTeacherId = String(session.userId);
  const currentDepartmentId = user.role === 'DEPARTMENT' ? String(session.userId) : (user.departmentId ? String(user.departmentId) : null);

  let globalResources: any[] = [];
  try {
    const dbResources = await prisma.resource.findMany({
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
      include: {
        departments: { select: { id: true } },
        teachers: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    globalResources = dbResources.map(res => ({
      ...res,
      departmentIds: res.departments.map(d => d.id),
      teacherIds: res.teachers.map(t => t.id)
    }));
  } catch (error) {
    console.error("Failed to load resources from DB", error);
  }

  return (
    <DashboardClient 
      initialMaterials={materials} 
      sessionName={user.name} 
      description={user.description} 
      driveFolderId={user.driveFolderId} 
      initialGlobalResources={globalResources}
    />
  );
}

