import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return <SettingsClient currentEmail={session.email as string} />;
}
