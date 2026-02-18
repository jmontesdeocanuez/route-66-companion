import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader userName={session.name} />
      {children}
    </>
  );
}
