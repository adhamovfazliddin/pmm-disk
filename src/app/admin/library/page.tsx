import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import LibraryClient from "./LibraryClient";

export const dynamic = 'force-dynamic';

export default async function AdminLibraryPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string; email: string } | null;

  if (!session || session.role !== 'SUPERADMIN') {
    redirect('/');
  }

  let books: any[] = [];

  try {
    const [fetchedBooks] = await Promise.all([
      prisma.libraryBook.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true,
          driveUrl: true,
          category: true,
          publicationYear: true,
          pageCount: true,
          annotation: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);
    books = fetchedBooks;
  } catch (error) {
    console.error("Failed to load library books from DB", error);
  }

  return (
    <LibraryClient initialBooks={books} />
  );
}
