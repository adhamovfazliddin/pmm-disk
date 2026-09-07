export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import DepartmentsClient from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const [departments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "DEPARTMENT" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
  ]);

  return <DepartmentsClient initialDepartments={departments} />;
}
