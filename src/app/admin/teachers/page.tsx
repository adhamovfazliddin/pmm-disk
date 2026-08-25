export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: { department: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <TeachersClient initialTeachers={teachers} />;
}

