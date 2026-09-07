export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const [teachers] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
  ]);

  return <TeachersClient initialTeachers={teachers} />;
}

