import { prisma } from "@/lib/db";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { createdAt: "desc" },
  });

  return <TeachersClient initialTeachers={teachers} />;
}
