export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import MyResourcesClient from "./MyResourcesClient";

export default async function MyResourcesPage() {
  const session = (await getSession()) as { userId: string; role: string; name: string } | null;
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    redirect("/login");
  }

  const resources = await prisma.personalResource.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return <MyResourcesClient initialResources={resources} />;
}
