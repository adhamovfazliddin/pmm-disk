"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const personalResourceSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  url: z.string().url("Togri URL kiriting (https://...)"),
  type: z.enum(["video", "link"]),
  category: z.string().optional(),
  description: z.string().optional(),
});

export async function addPersonalResource(data: unknown) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    return { error: "Ruxsat etilmagan" };
  }

  const parsed = personalResourceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Malumotlar notogri", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const resource = await prisma.personalResource.create({
      data: {
        title: parsed.data.title,
        url: parsed.data.url,
        type: parsed.data.type,
        category: parsed.data.category || null,
        description: parsed.data.description || null,
        ownerId: session.userId as string,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, resource };
  } catch (error) {
    console.error("addPersonalResource error:", error);
    return { error: "Qoshishda xatolik yuz berdi" };
  }
}

export async function updatePersonalResource(id: string, data: unknown) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    return { error: "Ruxsat etilmagan" };
  }

  const parsed = personalResourceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Malumotlar notogri", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.personalResource.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== session.userId) {
    return { error: "Bu resurs sizga tegishli emas" };
  }

  try {
    const resource = await prisma.personalResource.update({
      where: { id },
      data: {
        title: parsed.data.title,
        url: parsed.data.url,
        type: parsed.data.type,
        category: parsed.data.category || null,
        description: parsed.data.description || null,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, resource };
  } catch (error) {
    console.error("updatePersonalResource error:", error);
    return { error: "Tahrirlashda xatolik yuz berdi" };
  }
}

export async function deletePersonalResource(id: string) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    return { error: "Ruxsat etilmagan" };
  }

  const existing = await prisma.personalResource.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== session.userId) {
    return { error: "Bu resurs sizga tegishli emas" };
  }

  try {
    await prisma.personalResource.delete({ where: { id } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("deletePersonalResource error:", error);
    return { error: "Ochirishda xatolik yuz berdi" };
  }
}
