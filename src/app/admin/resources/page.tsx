import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import ResourcesClient from "./ResourcesClient";

export default async function AdminResourcesPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string; email: string } | null;
  
  if (!session || session.role !== 'SUPERADMIN') {
    redirect('/');
  }

  let departments: any[] = [];
  let teachers: any[] = [];
  let globalResources: any[] = [];

  try {
    const dbResources = await prisma.resource.findMany({
      include: {
        departments: { select: { id: true } },
        teachers: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    globalResources = dbResources.map(res => ({
      ...res,
      departmentIds: res.departments.map(d => d.id),
      teacherIds: res.teachers.map(t => t.id)
    }));
  } catch (error) {
    console.error("Failed to load resources from DB", error);
  }

  try {
    departments = await prisma.user.findMany({
      where: { role: 'DEPARTMENT' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch departments", error);
  }

  try {
    teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: { id: true, name: true, department: { select: { name: true } } },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch teachers", error);
  }

  return (
    <ResourcesClient
      initialGlobalResources={globalResources}
      departments={departments}
      teachers={teachers}
    />
  );
}
