import { Metadata } from "next";
import { PublicProfileDisplay } from "@/app/(user)/(components)/profile-display";

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

  return <PublicProfileDisplay username={resolvedParams.username} />;
}
