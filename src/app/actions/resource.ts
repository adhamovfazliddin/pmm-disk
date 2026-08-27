"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function addGlobalResourceAction(data: any) {
  const { departmentIds, teacherIds, ...rest } = data;
  const newResource = await prisma.resource.create({
    data: {
      ...rest,
      departments: departmentIds?.length ? { connect: departmentIds.map((id: string) => ({ id })) } : undefined,
      teachers: teacherIds?.length ? { connect: teacherIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { departments: { select: { id: true } }, teachers: { select: { id: true } } }
  });

  const formattedResource = {
    ...newResource,
    departmentIds: newResource.departments.map(d => d.id),
    teacherIds: newResource.teachers.map(t => t.id)
  };

  revalidatePath("/admin");
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard");
  return { success: true, resource: formattedResource };
}

export async function updateGlobalResourceAction(id: string, data: any) {
  const { departmentIds, teacherIds, ...rest } = data;
  
  // Create update payload
  const updateData: any = { ...rest };
  
  if (departmentIds !== undefined) {
    updateData.departments = { set: departmentIds.map((deptId: string) => ({ id: deptId })) };
  }
  
  if (teacherIds !== undefined) {
    updateData.teachers = { set: teacherIds.map((tId: string) => ({ id: tId })) };
  }

  const updatedResource = await prisma.resource.update({
    where: { id },
    data: updateData,
    include: { departments: { select: { id: true } }, teachers: { select: { id: true } } }
  });

  const formattedResource = {
    ...updatedResource,
    departmentIds: updatedResource.departments.map(d => d.id),
    teacherIds: updatedResource.teachers.map(t => t.id)
  };

  revalidatePath("/admin");
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard");
  return { success: true, resource: formattedResource };
}

export async function deleteGlobalResourceAction(id: string) {
  await prisma.resource.delete({
    where: { id }
  });
  
  revalidatePath("/admin");
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard");
  return { success: true };
}
