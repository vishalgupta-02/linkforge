"use client";

import { usePublicProfile } from "@/queries/public-profile";
import { usePublicProfileStore } from "@/store";
import React, { useEffect } from "react";
import { LinkIcon, Home, LayoutDashboard } from "lucide-react";
import { THEMES, THEME_BUTTONS, ThemeKey } from "@/lib/themes";
import UserNotFound from "@/app/(user)/(components)/public-profile-not-found";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getPlatformConfig } from "@/components/custom/social-media-manager";
import type { PublicProfileSocial } from "@vyrex/types";

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
  const { data: session } = authClient.useSession();
  const setProfile = usePublicProfileStore((state) => state.setProfile);

  useEffect(() => {
    if (profile) {
      setProfile(profile);
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

  const selectedTheme =
    ((profile.data as any)?.theme || profile.theme || "default") as ThemeKey;
  const themeClass = THEMES[selectedTheme] || THEMES.default;
  const buttonClass = THEME_BUTTONS[selectedTheme] || THEME_BUTTONS.default;

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

  const socialLinks: PublicProfileSocial[] =
    profile.data?.socialLinks || profile.socialLinks || [];

  const isProOrBusiness =
    profile.data?.plan === "PRO" ||
    profile.data?.plan === "BUSINESS" ||
    (profile as any).plan === "PRO" ||
    (profile as any).plan === "BUSINESS";

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Link
          href={session?.user ? "/dashboard" : "/"}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-black/60 dark:text-white dark:hover:bg-black/80"
          title={session?.user ? "Go to your Dashboard" : "Return to LinkForge Home"}
        >
          {session?.user ? (
            <>
              <LayoutDashboard size={13} className="text-violet-500" />
              <span>Dashboard</span>
            </>
          ) : (
            <>
              <Home size={13} />
              <span>Home</span>
            </>
          )}
        </Link>
      </div>

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
              {displayUsername ? "@" + displayUsername : "LinkForge User"}
            </p>

            {displayBio && (
              <p className="max-w-sm px-4 text-[15px] leading-relaxed font-medium opacity-80">
                {displayBio}
              </p>
            )}

            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                {socialLinks.map((social) => {
                  const platformConfig = getPlatformConfig(social.platform);
                  const Icon = platformConfig.icon;
                  const redirectUrl = social.publicId
                    ? `/r/${social.publicId}`
                    : social.url;

                  return (
                    <a
                      key={social.publicId || social.id || social.platform}
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/80 p-2 shadow-xs backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/10 dark:hover:border-white/30"
                      title={platformConfig.name}
                    >
                      <Icon className="size-4.5 transition-transform duration-200 group-hover:scale-105" />
                    </a>
                  );
                })}
              </div>
            )}
          </header>

          <div className="animate-fade-in-up w-full space-y-3.5 delay-100">
            {profile.data?.links && profile.data.links.length > 0 ? (
              (() => {
                const links = profile.data.links;
                const sections: Array<{ id: string; title: string }> =
                  (profile.data as any).linkSection || [];

                const hasSections =
                  sections.length > 0 &&
                  links.some((l: any) => l.sectionId && sections.some((s) => s.id === l.sectionId));

                if (!hasSections) {
                  return links.map(
                    (link: {
                      publicId?: string;
                      id?: string;
                      url: string;
                      title: string;
                    }) => {
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
                  );
                }

                const renderedBlocks: React.ReactNode[] = [];

                sections.forEach((sec) => {
                  const secLinks = links.filter((l: any) => l.sectionId === sec.id);
                  if (secLinks.length > 0) {
                    renderedBlocks.push(
                      <div key={`section-${sec.id}`} className="w-full space-y-3 pt-3 first:pt-0">
                        <div className="flex items-center justify-center gap-2 py-1 opacity-70">
                          <span className="text-xs font-extrabold uppercase tracking-widest">
                            {sec.title}
                          </span>
                        </div>
                        {secLinks.map(
                          (link: {
                            publicId?: string;
                            id?: string;
                            url: string;
                            title: string;
                          }) => {
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
                        )}
                      </div>,
                    );
                  }
                });

                const ungrouped = links.filter(
                  (l: any) => !l.sectionId || !sections.some((s) => s.id === l.sectionId),
                );
                if (ungrouped.length > 0) {
                  renderedBlocks.push(
                    <div key="section-ungrouped" className="w-full space-y-3 pt-2 first:pt-0">
                      {ungrouped.map(
                        (link: {
                          publicId?: string;
                          id?: string;
                          url: string;
                          title: string;
                        }) => {
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
                      )}
                    </div>,
                  );
                }

                return renderedBlocks;
              })()
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-current/20 py-12 text-center opacity-60">
                <p className="text-sm font-semibold">No links yet.</p>
              </div>
            )}
          </div>

          {!isProOrBusiness && (
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
          )}
        </main>
      </div>
    </>
  );
}
