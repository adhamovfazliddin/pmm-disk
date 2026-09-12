"use server";

import { prisma as db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface SupportContact {
  name: string;
  phone: string;
  telegram: string;
}

export async function updateAdminContact(data: { supportContacts: SupportContact[] }) {
  const session = await getSession();
  
  if (!session || session.role !== "SUPERADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const cleanedContacts = (data.supportContacts || [])
      .map(contact => ({
        name: contact.name?.trim() || "",
        phone: contact.phone?.trim() || "",
        telegram: contact.telegram?.trim().startsWith('@') 
          ? contact.telegram.trim().substring(1) 
          : contact.telegram?.trim() || ""
      }))
      .filter(contact => contact.name || contact.phone || contact.telegram); // Faqat bo'm-bo'sh bo'lmaganlarini olamiz

    await db.user.update({
      where: { id: session.userId },
      data: {
        supportContacts: cleanedContacts as any,
      }
    });

    revalidatePath("/admin/contact");
    revalidatePath("/dashboard/contact");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update contact info:", error);
    return { success: false, error: "Failed to save contact information" };
  }
}

export async function getSuperAdminContact() {
  try {
    const admin = await db.user.findFirst({
      where: { role: "SUPERADMIN" },
      select: {
        supportContacts: true,
        // For fallback if needed
        phone: true, 
        telegram: true,
      }
    });
    return admin;
  } catch (error) {
    console.error("Failed to fetch superadmin contact:", error);
    return null;
  }
}