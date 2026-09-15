"use client";

import { usePublicProfile } from "@/queries/public-profile";
import { usePublicProfileStore } from "@/store";
import React, { useEffect } from "react";
import { LinkIcon } from "lucide-react";
import { THEMES, THEME_BUTTONS, ThemeKey } from "@/lib/themes";
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import UserNotFound from "@/app/(user)/(components)/public-profile-not-found";
import Link from "next/link";

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

const SOCIAL_COLORS = {
  instagram: "hover:text-pink-500",
  twitter: "hover:text-blue-400",
  linkedin: "hover:text-blue-600",
  youtube: "hover:text-red-500",
};

const DUMMY_SOCIALS = {
  instagram: "https://instagram.com/alex",
  twitter: "https://twitter.com/alex",
  linkedin: "https://linkedin.com/in/alex",
  youtube: "https://youtube.com/@alex",
};

interface PublicProfilePageProps {
  username: string;
}

export function PublicProfileDisplay({ username }: PublicProfilePageProps) {
  const {
    data: profile,
    isLoading,
    error,
    status,
  } = usePublicProfile(username);
  const setProfile = usePublicProfileStore((state) => state.setProfile);

  useEffect(() => {
    if (profile) {
      setProfile(profile);
      console.log("Profile data set in store:", profile);
    }
  }, [profile, setProfile]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (status === "error" || error || !profile) {
    return <UserNotFound />;
  }

  const themeClass = THEMES[profile.theme as ThemeKey] || THEMES.default;
  const buttonClass =
    THEME_BUTTONS[profile.theme as ThemeKey] || THEME_BUTTONS.default;

  const avatar = profile.data?.image || profile.image || profile.avatarUrl;
  const displayName =
    profile.data?.name ||
    profile.name ||
    profile.data?.userName ||
    profile.username ||
    "User Profile";
  const displayBio = profile.data?.bio || profile.bio;
  const displayUsername =
    profile.data?.userName || profile.username || profile.data?.name;

  return (
    <>
      <div
        className={`flex min-h-screen flex-col items-center px-5 py-12 font-sans transition-colors duration-300 sm:py-16 ${themeClass}`}
      >
        <main className="relative z-10 flex w-full max-w-[600px] flex-1 flex-col items-center sm:max-w-md">
          <header className="animate-fade-in-up mb-8 flex w-full flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="h-24 w-24 rounded-full bg-current/10 p-1 shadow-sm sm:h-28 sm:w-28">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="h-full w-full rounded-full border-2 border-transparent object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full border-2 border-transparent bg-current/10" />
                )}
              </div>
            </div>

            <h1 className="mb-1 text-2xl font-extrabold tracking-tight">
              {displayName}
            </h1>

            <p className="mb-4 text-[13px] font-semibold opacity-60">
              {!displayUsername ? "@" + displayUsername : "LinkForge User"}
            </p>

            {displayBio && (
              <p className="max-w-sm px-4 text-[15px] leading-relaxed font-medium opacity-80">
                {displayBio}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              {Object.entries(DUMMY_SOCIALS).map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS];
                const colorClass =
                  SOCIAL_COLORS[key as keyof typeof SOCIAL_COLORS];

                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex size-8 items-center justify-center rounded-full border bg-zinc-100 px-2 py-2 transition hover:scale-110 hover:shadow-md ${colorClass}`}
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </header>

          <div className="animate-fade-in-up w-full space-y-3.5 delay-100">
            {profile.data?.links && profile.data.links.length > 0 ? (
              profile.data.links.map(
                (link: { publicId?: string; id?: string; url: string; title: string }) => {
                  const redirectIdentifier = link.publicId || link.id;
                  const redirectUrl = `/r/${redirectIdentifier}`;
                  return (
                    <Link
                      key={redirectIdentifier}
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex w-full items-center justify-center rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] ${buttonClass}`}
                    >
                      <span className="truncate px-2 text-[15px] font-bold">
                        {link.title}
                      </span>
                    </Link>
                  );
                },
              )
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-current/20 py-12 text-center opacity-60">
                <p className="text-sm font-semibold">No links yet.</p>
              </div>
            )}
          </div>

          <div className="animate-fade-in-up mt-16 mb-8 delay-200">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100"
            >
              <LinkIcon size={12} strokeWidth={3} />
              <span className="text-[11px] font-bold tracking-widest uppercase">
                Linkforge
              </span>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
