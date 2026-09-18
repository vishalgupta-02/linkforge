import { Metadata } from "next";
import { PublicProfileDisplay } from "@/app/(user)/(components)/profile-display";
import { PublicProfilePresence } from "@/components/custom/public-page-presence";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/users/public/${username}`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      const profile = json.data;
      const displayName = profile?.name || profile?.userName || username;
      const bio =
        profile?.bio || `Check out @${username}'s links and socials on LinkForge.`;
      const avatar = profile?.image;

      return {
        title: `${displayName} (@${username})`,
        description: bio,
        openGraph: {
          title: `${displayName} (@${username}) | LinkForge`,
          description: bio,
          type: "profile",
          username: username,
          images: avatar
            ? [
                {
                  url: avatar,
                  width: 400,
                  height: 400,
                  alt: `${displayName}'s avatar`,
                },
              ]
            : undefined,
        },
        twitter: {
          card: "summary",
          title: `${displayName} (@${username}) | LinkForge`,
          description: bio,
          images: avatar ? [avatar] : undefined,
        },
      };
    }
  } catch {

  }

  return {
    title: `@${username} | LinkForge`,
    description: `Explore links, socials, and projects by @${username} on LinkForge.`,
    openGraph: {
      title: `@${username} | LinkForge`,
      description: `Explore links, socials, and projects by @${username} on LinkForge.`,
    },
    twitter: {
      card: "summary",
      title: `@${username} | LinkForge`,
      description: `Explore links, socials, and projects by @${username} on LinkForge.`,
    },
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
