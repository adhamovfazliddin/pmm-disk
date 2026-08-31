import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import LibraryClient from "./LibraryClient";

export default async function AdminLibraryPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string; email: string } | null;
  
  if (!session || session.role !== 'SUPERADMIN') {
    redirect('/');
  }

  let books: any[] = [];

  try {
    books = await prisma.libraryBook.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to load library books from DB", error);
  }

  return (
    <LibraryClient initialBooks={books} />
  );
}
