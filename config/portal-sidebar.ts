import {
  FolderKanban,
  Sparkles,
} from "lucide-react";

export type PortalSidebarNavItem = {
  title: string;
  href?: string;
  icon?: any;
  items?: PortalSidebarNavItem[];
};

export type PortalSidebarNavGroup = {
  title: string;
  items: PortalSidebarNavItem[];
};

export const portalSidebarData: PortalSidebarNavGroup[] = [
  {
    title: "GENEL BAKIŞ",
    items: [
      { title: "Dashboard", href: "/portal", icon: Sparkles },
    ],
  },
];
