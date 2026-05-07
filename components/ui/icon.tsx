'use client';

import { Icon as IconifyIcon } from '@iconify/react';

export function Icon({ icon, className }: { icon: string; className?: string }) {
  return <IconifyIcon icon={icon} className={className} />;
}
