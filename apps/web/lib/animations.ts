export const TRANSITION_EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const TRANSITION_SPRING = { type: "spring", stiffness: 300, damping: 25 } as const;
export const TRANSITION_BOUNCE = { type: "spring", stiffness: 400, damping: 15 } as const;
export const TRANSITION_SLOW = { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } as const;

export const fadeInVariants = {
  hidden: (direction: "up" | "down" | "left" | "right" | "none" = "up") => ({
    opacity: 0,
    y: direction === "up" ? 24 : direction === "down" ? -24 : 0,
    x: direction === "left" ? 24 : direction === "right" ? -24 : 0,
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.55,
      ease: TRANSITION_EASE_OUT,
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerChildren = 0.08) => ({
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren: 0.05,
    },
  }),
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: TRANSITION_EASE_OUT,
    },
  },
};

export const floatSubtleVariants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
