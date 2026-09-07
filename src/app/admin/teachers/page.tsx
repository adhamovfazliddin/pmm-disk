export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const [teachers, activityStats] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: { select: { name: true } },
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedMaterials: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    }),
    // Ko'rish va yuklab olish soni — groupBy bilan samarali
    prisma.materialActivity.groupBy({
      by: ['teacherId', 'actionType'],
      _count: { id: true },
      where: { teacherId: { not: null } },
    }),
  ]);

  // Statistikani har bir o'qituvchiga biriktirish
  const teachersWithStats = teachers.map(teacher => {
    const views = activityStats
      .filter(a => a.teacherId === teacher.id && a.actionType === 'VIEW')
      .reduce((sum, a) => sum + a._count.id, 0);
    const downloads = activityStats
      .filter(a => a.teacherId === teacher.id && a.actionType === 'DOWNLOAD')
      .reduce((sum, a) => sum + a._count.id, 0);
    return {
      ...teacher,
      stats: {
        materials: teacher._count.assignedMaterials,
        views,
        downloads,
      }
    };
  });

  return <TeachersClient initialTeachers={teachersWithStats} />;
}
