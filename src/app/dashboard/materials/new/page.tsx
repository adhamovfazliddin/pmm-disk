import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import NewMaterialClient from "./NewMaterialClient";

export const dynamic = "force-dynamic";

export default async function NewMaterialPage() {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "DEPARTMENT")) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <NewMaterialClient />
    </div>
  );
}
