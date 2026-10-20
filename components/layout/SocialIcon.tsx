/** Sosial şəbəkə ikonları — lucide-də brend ikonları olmadığı üçün sadə SVG */
const paths = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  facebook: <path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />,
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path fill="currentColor" d="m10 9 5 3-5 3V9Z" />
    </>
  ),
  tiktok: <path fill="currentColor" d="M16.6 3c.3 2.1 1.6 3.5 3.7 3.7v3c-1.4.1-2.6-.3-3.7-1v6.2c0 3.5-2.6 5.6-5.6 5.6a5.4 5.4 0 0 1-5.4-5.4c0-3.4 3-5.8 6.3-5.3v3.1c-1.6-.4-3.2.6-3.2 2.2 0 1.3 1 2.3 2.3 2.3 1.4 0 2.4-.9 2.4-2.8V3h3.2Z" />,
} as const;

export type SocialNetwork = keyof typeof paths;

export function SocialIcon({ network, className }: { network: SocialNetwork; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {paths[network]}
    </svg>
  );
}
