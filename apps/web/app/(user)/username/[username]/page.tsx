import { Metadata } from "next";
import { PublicProfileDisplay } from "@/app/(user)/(components)/profile-display";
import { PublicProfilePresence } from "@/components/custom/public-page-presence";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Profile",
    description: "Check out this user's links",
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <>
      <PublicProfilePresence username={resolvedParams.username} />
      <PublicProfileDisplay username={resolvedParams.username} />
    </>
  );
}

