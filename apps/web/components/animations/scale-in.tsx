"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { TRANSITION_SPRING, TRANSITION_EASE_OUT } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ScaleInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  initialScale?: number;
  type?: "spring" | "ease";
  viewportOnce?: boolean;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  initialScale = 0.92,
  type = "spring",
  viewportOnce = true,
  ...props
}: ScaleInProps) {
  const transition =
    type === "spring"
      ? { ...TRANSITION_SPRING, delay }
      : { duration: 0.45, ease: TRANSITION_EASE_OUT, delay };

  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: viewportOnce, margin: "-30px" }}
      transition={transition}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
