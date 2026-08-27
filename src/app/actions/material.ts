"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { extractDriveId } from "@/lib/drive";
import { getSession } from "@/lib/session";

const materialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().min(1),
  format: z.string().min(1),
  driveUrl: z.string().min(1),
  visibility: z.enum(["GLOBAL", "RESTRICTED"]),
  assignedTeacherIds: z.array(z.string()).optional(),
});

export async function createMaterial(data: unknown) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = materialSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid data.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const driveFileId = extractDriveId(parsed.data.driveUrl);
  if (!driveFileId) {
    return { error: "Could not parse Google Drive URL." };
  }

  try {
    await prisma.material.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        subject: parsed.data.subject,
        format: parsed.data.format,
        visibility: parsed.data.visibility,
        driveFileId,
        createdById: session.userId as string,
        assignments: parsed.data.visibility === "RESTRICTED" && parsed.data.assignedTeacherIds
          ? {
              create: parsed.data.assignedTeacherIds.map(teacherId => ({ teacherId }))
            }
          : undefined,
      }
    });
    revalidatePath("/admin/materials");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create material." };
  }
}

export async function deleteMaterial(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  try {
    // Delete dependent records first to avoid foreign key constraint errors
    await prisma.materialActivity.deleteMany({ where: { materialId: id } });
    await prisma.materialAssignment.deleteMany({ where: { materialId: id } });
    await prisma.material.delete({ where: { id } });
    
    revalidatePath("/admin/materials");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete material:", error);
    return { error: "Materialni o'chirishda xatolik yuz berdi." };
  }
}

const materialUpdateSchema = materialSchema.extend({
  id: z.string().min(1),
});

export async function updateMaterial(data: unknown) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = materialUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid data.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const driveFileId = extractDriveId(parsed.data.driveUrl);
  if (!driveFileId) {
    return { error: "Could not parse Google Drive URL." };
  }

  try {
    await prisma.material.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        subject: parsed.data.subject,
        format: parsed.data.format,
        visibility: parsed.data.visibility,
        driveFileId,
        assignments: {
          deleteMany: {},
          create: parsed.data.visibility === "RESTRICTED" && parsed.data.assignedTeacherIds
            ? parsed.data.assignedTeacherIds.map(teacherId => ({ teacherId }))
            : []
        }
      }
    });
    revalidatePath("/admin/materials");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update material." };
  }
}
