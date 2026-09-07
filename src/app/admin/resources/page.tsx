import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import ResourcesClient from "./ResourcesClient";

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string; email: string } | null;
  
  if (!session || session.role !== 'SUPERADMIN') {
    redirect('/');
  }

  let departments: any[] = [];
  let teachers: any[] = [];
  let globalResources: any[] = [];

  try {
    const [dbResources, dbDepartments, dbTeachers] = await Promise.all([
      prisma.resource.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          url: true,
          category: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
          departments: { select: { id: true } },
          teachers: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { role: 'DEPARTMENT' },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: { id: true, name: true, department: { select: { name: true } } },
        orderBy: { name: 'asc' }
      })
    ]);
    
    globalResources = dbResources.map(res => ({
      ...res,
      departmentIds: res.departments.map(d => d.id),
      teacherIds: res.teachers.map(t => t.id)
    }));
    departments = dbDepartments;
    teachers = dbTeachers;
  } catch (error) {
    console.error("Failed to load resources data", error);
  }

  return (
    <ResourcesClient
      initialGlobalResources={globalResources}
      departments={departments}
      teachers={teachers}
    />
  );
}
