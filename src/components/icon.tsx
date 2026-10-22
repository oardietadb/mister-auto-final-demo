import type { ReactNode } from "react";

const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  car: <><path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Z M5 7h14 M3 13h18 M6 18v3 M18 18v3 M6 10h2 M16 10h2" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  cart: <><path d="M2 3h3l3 12h11l3-9H6 M9 15l-1 3h12" /><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /></>,
  menu: <path d="M4 6h16 M4 12h16 M4 18h16" />,
  arrow: <path d="M4 12h16 m-6-6 6 6-6 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  truck: <><path d="M2 5h12v12H2z M14 9h4l4 4v4h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  shield: <><path d="m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3Z m-4 9 3 3 5-5" /></>,
  returns: <><path d="M4 10a8 8 0 1 1 1 8 M4 4v6h6" /></>,
  headset: <><path d="M3 14v-3a9 9 0 0 1 18 0v3 M3 12h4v7H3z M17 12h4v7h-4z M21 19c0 2-3 3-7 3" /></>,
  card: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 9h20 M6 15h4" /></>,
  snow: <><path d="M12 2v20 M3.3 7l17.4 10 M3.3 17 20.7 7 M9 4l3 3 3-3 M9 20l3-3 3 3 M3 10l4-1-1-4 M18 19l-1-4 4-1 M3 14l4 1-1 4 M18 5l-1 4 4 1" /></>,
  recycle: <><path d="m8 6 3-4 5 8 M14 10h3l1-3 M19 13l3 5H12 M14 15l-3 3 3 3 M8 18H2l5-9 M4 10l4-2 2 4" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
