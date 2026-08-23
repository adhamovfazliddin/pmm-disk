export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";
import { getAdminAnalytics } from "@/app/actions/analytics";

export default async function AdminDashboard() {
  const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
  const totalMaterials = await prisma.material.count();
  const globalMaterials = await prisma.material.count({ where: { visibility: "GLOBAL" } });
  const restrictedMaterials = await prisma.material.count({ where: { visibility: "RESTRICTED" } });
  const analytics = await getAdminAnalytics();

  const subjectsGroupBy = await prisma.material.groupBy({
    by: ['subject'],
  });
  const activeDepartments = subjectsGroupBy.length;

  const recentMaterials = await prisma.material.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { createdBy: { select: { name: true } } }
  });

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

