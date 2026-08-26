export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getResources } from "@/lib/resourceStore";

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

  let globalResources: any[] = [];
  try {
    globalResources = getResources() || [];
  } catch (err) {
    console.error("Failed to load resources.json", err);
  }

  const currentTeacherId = String(session.userId);
  const currentDepartmentId = user.role === 'DEPARTMENT' ? String(session.userId) : (user.departmentId ? String(user.departmentId) : null);

  globalResources = globalResources.filter((res: any) => {
    if (!res.visibility || res.visibility === 'GLOBAL') return true;
    if (res.visibility === 'RESTRICTED') {
      const matchesTeacher = res.teacherIds && res.teacherIds.map(String).includes(currentTeacherId);
      const matchesDepartment = currentDepartmentId && res.departmentIds && res.departmentIds.map(String).includes(currentDepartmentId);
      return matchesTeacher || matchesDepartment;
    }
    return false;
  });

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

