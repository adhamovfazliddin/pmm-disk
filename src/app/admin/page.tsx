export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";
import { getAdminAnalytics } from "@/app/actions/analytics";

export default async function AdminDashboard() {
  const [
    totalTeachers,
    totalMaterials,
    subjectsGroupBy,
    recentMaterials,
    analytics,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.material.count(),
    prisma.material.groupBy({ by: ['subject'] }),
    prisma.material.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        subject: true,
        format: true,
        createdAt: true,
        createdBy: { select: { name: true } }
      }
    }),
    getAdminAnalytics(),
  ]);

  const activeDepartments = subjectsGroupBy.length;

  return (
    <AdminClient
      totalTeachers={totalTeachers}
      totalMaterials={totalMaterials}
      activeDepartments={activeDepartments}
      recentMaterials={recentMaterials}
      analytics={analytics}
    />
  );
}

