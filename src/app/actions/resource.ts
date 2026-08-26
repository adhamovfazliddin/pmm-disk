"use server";

import { revalidatePath } from "next/cache";
import { addResource, deleteResource, GlobalResource, updateResource } from "@/lib/resourceStore";

export async function addGlobalResourceAction(data: Omit<GlobalResource, "id">) {
  const newResource = addResource(data);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, resource: newResource };
}

export async function updateGlobalResourceAction(id: string, data: Partial<GlobalResource>) {
  const updatedResource = updateResource(id, data);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: !!updatedResource, resource: updatedResource };
}

export async function deleteGlobalResourceAction(id: string) {
  const success = deleteResource(id);
  if (success) {
    revalidatePath("/admin");
    revalidatePath("/dashboard");
  }
  return { success };
}
