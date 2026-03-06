import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OnboardingScreen } from "@/components/onboarding-screen";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  if (session.mustChangePassword) {
    redirect("/cambiar-contrasena");
  }

  if (session.onboardingCompleted) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      avatar: true,
      displayName: true,
      nickname: true,
      bio: true,
      phone: true,
      emergencyContact: true,
      dietaryRestrictions: true,
      allergies: true,
    },
  });

  return (
    <OnboardingScreen
      userName={session.name}
      avatar={user?.avatar ?? null}
      initialProfile={{
        displayName: user?.displayName ?? "",
        nickname: user?.nickname ?? "",
        bio: user?.bio ?? "",
        phone: user?.phone ?? "",
        emergencyContact: user?.emergencyContact ?? "",
        dietaryRestrictions: user?.dietaryRestrictions ?? "",
        allergies: user?.allergies ?? "",
      }}
    />
  );
}
