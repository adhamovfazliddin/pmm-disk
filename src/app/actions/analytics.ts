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
    // 1. Total Views and Downloads
    const totalViews = await db.materialActivity.count({
      where: { actionType: 'VIEW' }
    });

    const totalDownloads = await db.materialActivity.count({
      where: { actionType: 'DOWNLOAD' }
    });

    // 2. Top Materials
    const materials = await db.material.findMany({
      include: {
        _count: {
          select: {
            activities: true,
          }
        },
        activities: {
          select: { actionType: true }
        }
      }
    });

    const materialsWithStats = materials.map(m => {
      const views = m.activities.filter(a => a.actionType === 'VIEW').length;
      const downloads = m.activities.filter(a => a.actionType === 'DOWNLOAD').length;
      return {
        id: m.id,
        title: m.title,
        subject: m.subject,
        views,
        downloads,
        totalInteractions: views + downloads
      };
    }).sort((a, b) => b.totalInteractions - a.totalInteractions).slice(0, 5);

    // 3. Top Active Teachers
    const teachers = await db.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        _count: {
          select: { activities: true }
        }
      },
      orderBy: {
        activities: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const topTeachers = teachers.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      activityCount: t._count.activities
    }));

    // 4. Activity Timeline (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await db.materialActivity.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true,
        actionType: true
      }
    });

    const timelineMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timelineMap.set(dateStr, { name: dateStr, views: 0, downloads: 0 });
    }

    activities.forEach(activity => {
      const dateStr = activity.createdAt.toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        const item = timelineMap.get(dateStr);
        if (activity.actionType === 'VIEW') item.views += 1;
        if (activity.actionType === 'DOWNLOAD') item.downloads += 1;
      }
    });

    const timeline = Array.from(timelineMap.values()).reverse();

    // 5. Subject Distribution
    const subjectDistributionRaw = await db.material.groupBy({
      by: ['subject'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8
    });
    const subjectDistribution = subjectDistributionRaw.map(item => ({
      name: item.subject,
      count: item._count.id
    }));

    // 6. Format Distribution
    const formatDistributionRaw = await db.material.groupBy({
      by: ['format'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    const formatDistribution = formatDistributionRaw.map(item => ({
      name: item.format,
      count: item._count.id
    }));

    return {
      totalViews,
      totalDownloads,
      topMaterials: materialsWithStats,
      topTeachers,
      timeline,
      subjectDistribution,
      formatDistribution
    };
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return null;
  }
}
