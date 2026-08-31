import { prisma } from "@/lib/db";
import PublicLibraryClient from "./PublicLibraryClient";

export default async function PublicLibraryPage() {
  let books: any[] = [];

  try {
    books = await prisma.libraryBook.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to load library books from DB", error);
  }

  return (
    <PublicLibraryClient initialBooks={books} />
  );
}
