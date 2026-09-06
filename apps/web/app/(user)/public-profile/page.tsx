"use client";

import {
  BadgeCheck,
  ArrowUpRight,
  Twitter,
  Instagram,
  Mail,
  Link as LinkIcon,
  Loader2,
  Pentagon,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublicProfile } from "@/apis/get-public-profile";
import { authClient } from "@/lib/auth-client";
import type { User, Link as LinkType } from "@vyrex/types";
import { getMe } from "@/apis/get-user-profile";

interface PublicProfileData {
  id: string;
  name: string;
  email: string | null;
  userName: string;
  plan: string | null;
  bio: string | null;
  image: string | null;
  links: LinkType[];
}

export default function CreatorPublicProfile() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Inside the Public page");
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const username = await getMe(session?.user?.id || "");
        console.log("Inside the useeffect");

        if (!username) {
          // User doesn't have a username (likely from social signin)
          setError("Please set up your username to view your public profile");

          setLoading(false);
          // Redirect to settings/profile page to complete username setup

          setTimeout(() => {
            router.push("/dashboard/settings");
          }, 2000);

          return;
        }

        // Fetch public profile using the public API
        const data = await getPublicProfile(username.data.userName);

        setProfileData(data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user, router]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#fafafa] pb-20 font-sans text-zinc-950 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#fafafa] pb-20 font-sans text-zinc-950 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            {error || "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  const { email, name, plan, userName, bio, image, links } = profileData;

  const publicLinks = links.filter(
    (link) => link.isActive && !link.scheduledStart,
  );

  return (
    <>
      <div className="relative min-h-screen bg-[#fafafa] pb-20 font-sans text-zinc-950 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-125 bg-linear-to-b from-violet-500/10 via-transparent to-transparent dark:from-violet-500/15" />

        <div className="fixed top-4 right-4 z-50">
          <AnimatedThemeToggler className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white p-0 text-zinc-600 shadow-sm transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-zinc-400" />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-150 px-5 pt-16 md:pt-24">
          <header className="animate-fade-in-up mb-10 flex flex-col items-center text-center">
            <div className="group relative mb-4 cursor-pointer">
              <div className="h-24 w-24 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 p-1 shadow-lg transition-transform duration-300 group-hover:scale-105">
                <img
                  src={
                    image ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                  }
                  alt={name || userName}
                  className="h-full w-full rounded-full border-4 border-[#fafafa] object-cover transition-colors duration-300 dark:border-[#0a0a0a]"
                />
              </div>
            </div>

            <div className="mb-2 flex items-center gap-1.5">
              <h1 className="font-custom-sans text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {name || userName}
              </h1>
              {plan === "PRO" && (
                <BadgeCheck size={18} className="shrink-0 text-violet-500" />
              )}
            </div>

            <p className="font-custom-serif mb-4 max-w-sm text-[15px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-300">
              @{name ? name : "userName"} {bio && `- ${bio}`}
            </p>

            <div className="flex items-center justify-center gap-4 text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href={`mailto:${email}`}
                  className="transition-colors hover:text-zinc-950 dark:hover:text-white"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </header>

          <div className="w-full space-y-4">
            {publicLinks.length > 0 ? (
              publicLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-fade-in-up flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:scale-[0.98] dark:border-white/10 dark:bg-white/3 dark:hover:bg-white/5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-105 dark:bg-violet-500/10 dark:text-violet-400">
                    <LinkIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold text-zinc-900 dark:text-white">
                      {link.title}
                    </h3>
                    <p className="truncate text-[13px] font-medium text-zinc-500">
                      {new URL(link.url).hostname}
                    </p>
                  </div>
                  <div className="shrink-0 pr-2">
                    <ArrowUpRight
                      size={18}
                      className="text-zinc-400 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white"
                    />
                  </div>
                </a>
              ))
            ) : (
              <div className="animate-fade-in-up flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center dark:border-white/10">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5">
                  <LinkIcon size={20} className="text-zinc-400" />
                </div>
                <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white">
                  No public links yet
                </h3>
                <p className="text-xs font-medium text-zinc-500">
                  Your audience is waiting.
                </p>
              </div>
            )}
          </div>

          <div
            className="animate-fade-in-up mt-16 flex justify-center"
            style={{ animationDelay: "500ms" }}
          >
            <a
              href="#"
              className="group flex items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-200 transition-colors group-hover:bg-violet-500 dark:bg-white/10">
                <Pentagon
                  size={10}
                  className="text-zinc-600 transition-colors group-hover:text-white dark:text-zinc-400"
                  strokeWidth={3}
                />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Powered by Linkforge
              </span>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
