"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
}

const POSTS: BlogPost[] = [
  {
    slug: "sub-10ms-redirects",
    title: "Engineering Sub-10ms Edge Redirects: Why Every Millisecond Matters",
    excerpt:
      "When a follower taps a link in your bio, a 500ms delay drops conversion by 18%. Here is how we redesigned HTTP 302 routing using Redis caching, Express, and asynchronous BullMQ workers.",
    category: "Engineering",
    date: "Sep 18, 2026",
    readTime: "4 min read",
    author: {
      name: "Abhimanyu Gupta",
      role: "Lead Systems Architect",
    },
  },
  {
    slug: "real-time-presence-psychology",
    title: "The Psychology of Real-Time Presence: Why Concurrent Visitor Count Boosts Engagement",
    excerpt:
      "Static pages feel dead. When visitors see a pulsating badge showing 40 other people browsing your profile right now, social proof transforms passive browsing into active clicks.",
    category: "Product & Growth",
    date: "Sep 10, 2026",
    readTime: "6 min read",
    author: {
      name: "LinkForge Team",
      role: "Growth & Telemetry",
    },
  },
  {
    slug: "mobile-deep-linking-guide",
    title: "Escape the Webview Trap: How Mobile App Deep Linking Keeps Creators Connected",
    excerpt:
      "In-app webviews in Instagram and TikTok force users to log into YouTube and Spotify all over again. Our smart protocol handler launches native apps seamlessly with instant fallbacks.",
    category: "Mobile",
    date: "Sep 02, 2026",
    readTime: "5 min read",
    author: {
      name: "Mobile Edge Team",
      role: "Protocol Engineering",
    },
  },
];

export default function BlogPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        {/* Header */}
        <div className="mb-14 text-center space-y-3">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <BookOpen size={13} />
            <span>The LinkForge Journal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Engineering, Design & Creator Insights
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Deep dives into distributed systems, edge performance, and audience retention.
          </p>
        </div>

        {/* Featured / Articles List */}
        <div className="space-y-8">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="border-border bg-card/60 hover:border-primary/40 rounded-2xl border p-8 backdrop-blur-md transition-all hover:shadow-xl group"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="border-primary/20 bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full border text-[10px] uppercase">
                  {post.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar size={12} /> {post.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>

              <h2 className="text-foreground text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {post.title}
              </h2>

              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {post.excerpt}
              </p>

              <div className="border-border border-t mt-6 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-foreground text-xs font-bold">{post.author.name}</div>
                  <div className="text-muted-foreground text-[11px]">{post.author.role}</div>
                </div>

                <div className="text-primary font-semibold text-xs flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
