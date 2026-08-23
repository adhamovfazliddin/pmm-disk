"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { getSession } from "@/lib/session";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6).optional(),
  department: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  driveFolderId: z.string().optional().nullable(),
});

export async function createTeacher(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = userSchema.safeParse(data);
  
  if (!parsed.success) {
    console.error("Zod validation error (createTeacher):", parsed.error.format());
    return { error: "Forma ma'lumotlari noto'g'ri (Email xato yoki maydonlar bo'sh).", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (!parsed.data.password) {
    return { error: "Parol kiritilishi shart (kamida 6 ta belgi)." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: hashedPassword,
        role: Role.TEACHER,
        department: parsed.data.department,
        description: parsed.data.description,
        driveFolderId: parsed.data.driveFolderId,
      }
    });
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error) {
    console.error("Prisma create teacher error:", error);
    return { error: error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi" };
  }
}

export async function updateTeacher(id: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = userSchema.safeParse(data);
  
  if (!parsed.success) {
    console.error("Zod validation error (updateTeacher):", parsed.error.format());
    return { error: "Forma ma'lumotlari noto'g'ri (Email xato yoki maydonlar bo'sh).", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = {
    email: parsed.data.email,
    name: parsed.data.name,
    department: parsed.data.department,
    description: parsed.data.description,
    driveFolderId: parsed.data.driveFolderId,
  };

  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error) {
    console.error("Prisma update teacher error:", error);
    return { error: error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi" };
  }
}

export async function toggleTeacherStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/teachers");
}

export async function deleteTeacher(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return { success: false, error: "Unauthorized" };
  }
  
  if (session.userId === id) {
    return { success: false, error: "Cannot delete your own account" };
  }

  try {
    await prisma.$transaction([
      prisma.materialActivity.deleteMany({ where: { teacherId: id } }),
      prisma.materialAssignment.deleteMany({ where: { teacherId: id } }),
      prisma.user.delete({ where: { id } })
    ]);
    
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete teacher error:", error);
    return { success: false, error: "Failed to delete teacher." };
  }
}

