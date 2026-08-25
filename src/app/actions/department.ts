"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { extractDriveId } from "@/lib/drive";
import bcrypt from "bcryptjs";

const departmentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  description: z.string().optional(),
  driveFolderId: z.string().optional(),
});

export async function createDepartment(data: unknown) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  const parsed = departmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data.", fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, email, password, description, driveFolderId } = parsed.data;
  
  if (!password) {
    return { error: "Password is required for a new department." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "User or Department with this email already exists." };

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const driveId = driveFolderId ? extractDriveId(driveFolderId) : null;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        description,
        driveFolderId: driveId || null,
        role: "DEPARTMENT",
      }
    });
    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create department." };
  }
}

export async function updateDepartment(data: unknown) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  const updateSchema = departmentSchema.extend({
    id: z.string().min(1),
  });

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid data." };

  const { id, name, email, password, description, driveFolderId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) {
    return { error: "Email is already taken." };
  }

  const updateData: any = {
    name,
    email,
    description,
    driveFolderId: driveFolderId ? extractDriveId(driveFolderId) : null,
  };

  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update department." };
  }
}

export async function toggleDepartmentStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/admin/departments");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") return { error: "Unauthorized" };

  await prisma.user.delete({
    where: { id }
  });
  revalidatePath("/admin/departments");
  return { success: true };
}
