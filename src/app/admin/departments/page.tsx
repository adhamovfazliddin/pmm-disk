export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import DepartmentsClient from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const departments = await prisma.user.findMany({
    where: { role: "DEPARTMENT" },
    orderBy: { createdAt: "desc" },
  });

  return <DepartmentsClient initialDepartments={departments} />;
}
