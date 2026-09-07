export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import PublicLibraryClient from "./PublicLibraryClient";

export default async function PublicLibraryPage() {
  let books: any[] = [];

  try {
    books = await prisma.libraryBook.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to load library books from DB", error);
  }

  return (
    <PublicLibraryClient initialBooks={books} />
  );
}

