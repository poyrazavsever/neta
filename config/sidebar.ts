import {
  Activity,
  BarChart3,
  BookOpenText,
  Calendar,
  CheckSquare2,
  FileText,
  FolderKanban,
  MessageCircleHeart,
  Sparkles,
  Target,
  Users,
  Wallet,
  Building2,
  Tags,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  href?: string;
  icon?: any;
  items?: SidebarNavItem[]; // For nested (accordion) links later
};

export type SidebarNavGroup = {
  title: string;
  items: SidebarNavItem[];
};

export const sidebarData: SidebarNavGroup[] = [
  {
    title: "GENEL BAKIŞ",
    items: [
      { title: "Dashboard", href: "/", icon: Sparkles },
      { title: "Takvim", href: "/calendar", icon: Calendar },
      { title: "Analizler", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "YÖNETİM",
    items: [
      { title: "Görevler", href: "/tasks", icon: CheckSquare2 },
      { title: "Projeler", href: "/projects", icon: FolderKanban },
      { title: "Dökümanlar", href: "/documents", icon: FileText },
      { title: "Finans", href: "/finance", icon: Wallet },
    ],
  },
  {
    title: "KİŞİSEL",
    items: [
      { title: "Günlük", href: "/journal", icon: BookOpenText },
      { title: "Alışkanlıklar", href: "/habits", icon: Activity },
      { title: "Hedefler", href: "/goals", icon: Target },
    ],
  },
  {
    title: "ORGANİZASYON",
    items: [
      { title: "Ekip", href: "/team", icon: Users },
      { title: "Müşteriler", href: "/clients", icon: Building2 },
      { title: "Etiketler", href: "/tags", icon: Tags },
    ],
  },
  {
    title: "AI ASİSTAN",
    items: [
      { title: "Sohbet", href: "/chat", icon: MessageCircleHeart },
    ],
  },
];
