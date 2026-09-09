export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import DepartmentsClient from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const departments = await prisma.user.findMany({
    where: { role: "DEPARTMENT" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      description: true,
      driveFolderId: true,
      createdAt: true,
      lastLoginAt: true,
      // O'sha kafedradagi o'qituvchilar ro'yxati
      teachers: {
        where: { role: "TEACHER" },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      },
      _count: {
        select: { teachers: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return <DepartmentsClient initialDepartments={departments} />;
}
