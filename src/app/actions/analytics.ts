"use server";

import { prisma as db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function recordMaterialActivity(materialId: string, actionType: 'VIEW' | 'DOWNLOAD') {
  try {
    const session = await getSession() as { userId: string } | null;
    const teacherId = session?.userId;

    await db.materialActivity.create({
      data: {
        materialId,
        teacherId,
        actionType,
      },
    });
    return { success: true };
  } catch (error) {
    console.error(`Failed to record ${actionType} activity for material ${materialId}:`, error);
    return { success: false };
  }
}

export async function getAdminAnalytics() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return null;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // ✅ 6 ta so'rov bir vaqtda parallel bajariladi
    const [
      totalViews,
      totalDownloads,
      activityGrouped,
      topTeachersRaw,
      recentActivities,
      subjectDistributionRaw,
      formatDistributionRaw,
    ] = await Promise.all([
      db.materialActivity.count({ where: { actionType: 'VIEW' } }),
      db.materialActivity.count({ where: { actionType: 'DOWNLOAD' } }),
      db.materialActivity.groupBy({
        by: ['materialId', 'actionType'],
        _count: { id: true },
      }),
      db.user.findMany({
        where: { role: 'TEACHER' },
        select: { id: true, name: true, email: true, _count: { select: { activities: true } } },
        orderBy: { activities: { _count: 'desc' } },
        take: 5,
      }),
      db.materialActivity.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, actionType: true },
      }),
      db.material.groupBy({
        by: ['subject'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      db.material.groupBy({
        by: ['format'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    // Top materiallar hisoblash (include o'rniga groupBy natijasidan)
    const materialStatsMap = new Map<string, { views: number; downloads: number }>();
    activityGrouped.forEach(row => {
      if (!materialStatsMap.has(row.materialId)) {
        materialStatsMap.set(row.materialId, { views: 0, downloads: 0 });
      }
      const entry = materialStatsMap.get(row.materialId)!;
      if (row.actionType === 'VIEW') entry.views += row._count.id;
      if (row.actionType === 'DOWNLOAD') entry.downloads += row._count.id;
    });

    const topMaterialIds = [...materialStatsMap.entries()]
      .map(([id, stats]) => ({ id, ...stats, totalInteractions: stats.views + stats.downloads }))
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 5);

    const topMaterialDetails = await db.material.findMany({
      where: { id: { in: topMaterialIds.map(m => m.id) } },
      select: { id: true, title: true, subject: true },
    });

    const topMaterials = topMaterialIds.map(m => {
      const detail = topMaterialDetails.find(d => d.id === m.id);
      return { title: detail?.title ?? '', subject: detail?.subject ?? '', ...m };
    });

    // Timeline hisoblash
    const timelineMap = new Map<string, { name: string; views: number; downloads: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timelineMap.set(dateStr, { name: dateStr, views: 0, downloads: 0 });
    }
    recentActivities.forEach(activity => {
      const dateStr = activity.createdAt.toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        const item = timelineMap.get(dateStr)!;
        if (activity.actionType === 'VIEW') item.views += 1;
        if (activity.actionType === 'DOWNLOAD') item.downloads += 1;
      }
    });

    return {
      totalViews,
      totalDownloads,
      topMaterials,
      topTeachers: topTeachersRaw.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        activityCount: t._count.activities,
      })),
      timeline: Array.from(timelineMap.values()).reverse(),
      subjectDistribution: subjectDistributionRaw.map(item => ({ name: item.subject, count: item._count.id })),
      formatDistribution: formatDistributionRaw.map(item => ({ name: item.format, count: item._count.id })),
    };
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return null;
  }
}

