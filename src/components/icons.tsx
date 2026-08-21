type IconProps = { size?: number; color?: string }

const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const })

export function IconDaily({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  )
}
export function IconAsk({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5.5h16v10H9.5L5 19v-3.5H4v-10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9" cy="10.4" r="0.9" fill={color} />
      <circle cx="12" cy="10.4" r="0.9" fill={color} />
      <circle cx="15" cy="10.4" r="0.9" fill={color} />
    </svg>
  )
}
export function IconBook({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5c1.6-.8 4-1 8 .3V19c-4-1.3-6.4-1.1-8-.3V5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 5c-1.6-.8-4-1-8 .3V19c4-1.3 6.4-1.1 8-.3V5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
export function IconPipeline({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5h16l-6 7.2V18l-4 2v-7.8L4 5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
export function IconScan({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 8V5.5h3.5M20 8V5.5h-3.5M4 16v2.5h3.5M20 16v2.5h-3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="8" y="9" width="8" height="6" rx="1" stroke={color} strokeWidth="1.8" />
    </svg>
  )
}
export function IconRooms({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.4" stroke={color} strokeWidth="1.8" />
    </svg>
  )
}
export function IconMe({ size = 22, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="4" y="4" width="16" height="16" rx="2.4" stroke={color} strokeWidth="1.8" />
      <rect x="7.2" y="7.2" width="4" height="4" fill={color} />
      <rect x="12.5" y="7.2" width="1.6" height="1.6" fill={color} />
      <rect x="15.3" y="7.2" width="1.6" height="1.6" fill={color} />
      <rect x="12.5" y="10" width="1.6" height="1.6" fill={color} />
      <rect x="7.2" y="13" width="4" height="4" fill={color} opacity="0.4" />
      <rect x="12.5" y="13" width="1.6" height="4" fill={color} />
      <rect x="15.3" y="13" width="1.6" height="1.6" fill={color} />
    </svg>
  )
}
export function IconChevron({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size * 1.75} viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IconBack({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size * 1.65} viewBox="0 0 12 20" fill="none">
      <path d="M10 2L2 10l8 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function IconClose({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
export function IconCamera({ size = 40, color = 'currentColor' }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1-2h6l1 2h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.4" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
