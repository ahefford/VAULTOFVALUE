export function CrownIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
      <path
        d="M3 8.5 7 11l5-6 5 6 4-2.5-1.6 9.5H4.6L3 8.5Z"
        fill="var(--zc-gold)"
      />
      <rect x="4.6" y="18" width="14.8" height="2.2" fill="var(--zc-gold)" />
    </svg>
  )
}
