import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("theme", newTheme);
      return { theme: newTheme };
    }),
}));

type User = {
  id: string;
  name: string;
  email: string;
  userName: string;
  password?: string;
  bio?: string;
  image?: string;
};

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

type PublicProfile = {
  userId: string;
  name: string;
  userName: string;
  createdAt: Date;
  links: {
    id: string;
    title: string;
    url: string;
    position: number;
    sectionId: string;
  }[];
  sections: {
    id: string;
  }[];
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

interface PublicProfileStore {
  profile: PublicProfile | null;
  setProfile: (profile: PublicProfile | null) => void;
}

export const usePublicProfileStore = create<PublicProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
