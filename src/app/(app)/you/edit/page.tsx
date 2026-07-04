import { redirect } from "next/navigation";
import { getSessionMember } from "@/lib/auth";
import { getStudioRefs } from "@/lib/db";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const { user, member } = await getSessionMember();
  if (!user) redirect("/auth?next=/you/edit");
  // A member row is created on first sign-in; if it's somehow missing, the
  // account page is the safe place to land.
  if (!member) redirect("/you");

  const studios = await getStudioRefs();
  return <ProfileEditor member={member} email={user.email} studios={studios} />;
}
