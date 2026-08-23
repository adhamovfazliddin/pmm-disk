"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid credentials or account is disabled." };
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.password);
  if (!validPassword) {
    return { error: "Invalid credentials." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });

  if (user.role === "SUPERADMIN") {
    redirect("/admin");
  } else {
    redirect("/dashboard");
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

const updateProfileSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiritilishi shart"),
  newEmail: z.string().email("Yaroqsiz elektron pochta").optional().or(z.literal("")),
  newPassword: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Yangi parollar mos kelmadi",
  path: ["confirmPassword"],
});

export async function updateAdminProfile(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return { error: "Ruxsat etilmagan" };
  }

  const currentPassword = formData.get("currentPassword");
  const newEmail = formData.get("newEmail")?.toString().trim();
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  const parsed = updateProfileSchema.safeParse({ currentPassword, newEmail, newPassword, confirmPassword });
  
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) {
    return { error: "Foydalanuvchi topilmadi" };
  }

  const validPassword = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!validPassword) {
    return { fieldErrors: { currentPassword: ["Noto'g'ri joriy parol"] } };
  }

  const updateData: any = {};
  
  if (parsed.data.newEmail && parsed.data.newEmail !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.newEmail } });
    if (existing) {
      return { fieldErrors: { newEmail: ["Bu elektron pochta allaqachon band"] } };
    }
    updateData.email = parsed.data.newEmail;
  }

  if (parsed.data.newPassword) {
    updateData.password = await bcrypt.hash(parsed.data.newPassword, 10);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    if (updateData.email) {
      await createSession({ userId: user.id, role: user.role, name: user.name, email: updateData.email });
    }
  }

  return { success: true };
}
