export const dynamic = 'force-dynamic';
import AppLayout from "@/components/layout/AppLayout";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { prisma } from "@/lib/db";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    redirect("/login");
  }
  
  let user = null;
  let pendingCount = 0;
  try {
    user = await prisma.user.findUnique({ 
      where: { id: session.userId as string },
      include: { department: { select: { name: true } } }
    });
    pendingCount = await prisma.material.count({
      where: { status: "PENDING" }
    });
  } catch (err) {
    console.error("Database connection error in layout:", err);
  }
  
  return <AppLayout role={session.role as string} email={user?.email || ""} name={user?.name || ""} department={user?.department?.name || ""} pendingCount={pendingCount}>{children}</AppLayout>;
}

