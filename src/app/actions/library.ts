"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function addLibraryBook(data: any) {
  const newBook = await prisma.libraryBook.create({
    data: {
      title: data.title,
      author: data.author,
      category: data.category,
      coverImage: data.coverImage,
      driveUrl: data.driveUrl,
    }
  });

  revalidatePath("/admin/library");
  return { success: true, book: newBook };
}

export async function deleteLibraryBook(id: string) {
  await prisma.libraryBook.delete({
    where: { id }
  });
  
  revalidatePath("/admin/library");
  return { success: true };
}

export async function updateLibraryBook(id: string, data: any) {
  const updatedBook = await prisma.libraryBook.update({
    where: { id },
    data: {
      title: data.title,
      author: data.author,
      category: data.category,
      coverImage: data.coverImage,
      driveUrl: data.driveUrl,
    }
  });

  revalidatePath("/admin/library");
  return { success: true, book: updatedBook };
}
