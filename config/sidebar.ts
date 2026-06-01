import {
  BarChart3,
  BookOpenText,
  Building2,
  Calendar,
  CheckSquare2,
  FolderKanban,
  MessageCircleHeart,
  Sparkles,
  Wallet,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href?: string;
  icon?: any;
  items?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  title: string;
  items: SidebarNavItem[];
};

export const sidebarData: SidebarNavGroup[] = [
  {
    title: "GENEL BAKIS",
    items: [
      { title: "Dashboard", href: "/", icon: Sparkles },
      { title: "Takvim", href: "/calendar", icon: Calendar },
      { title: "Analizler", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "OPERASYON",
    items: [
      { title: "Musteriler", href: "/clients", icon: Building2 },
      { title: "Projeler", href: "/projects", icon: FolderKanban },
      { title: "Gorevler", href: "/tasks", icon: CheckSquare2 },
      { title: "Finans", href: "/finance", icon: Wallet },
    ],
  },
  {
    title: "KISISEL",
    items: [{ title: "Gunluk", href: "/journal", icon: BookOpenText }],
  },
  {
    title: "AI ASISTAN",
    items: [{ title: "Sohbet", href: "/chat", icon: MessageCircleHeart }],
  },
];
