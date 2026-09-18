"use client";

import React from "react";
import { motion } from "motion/react";
import { TRANSITION_EASE_OUT } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface RevealTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function RevealText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.04,
  as: Component = "h1",
}: RevealTextProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 18,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: TRANSITION_EASE_OUT,
      },
    },
  };

  return (
    <Component className={cn("inline-flex flex-wrap gap-x-2", className)}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="inline-flex flex-wrap gap-x-[0.3em] gap-y-1"
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className={cn("inline-block", wordClassName)}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}
