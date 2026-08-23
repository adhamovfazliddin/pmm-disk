export const dynamic = 'force-dynamic';
import AppLayout from "@/components/layout/AppLayout";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
  
  return <AppLayout role={session.role as string} email={user?.email || ""} name={user?.name || ""} department={user?.department || ""}>{children}</AppLayout>;
}

