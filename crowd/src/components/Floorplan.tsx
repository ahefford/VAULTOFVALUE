export function Floorplan() {
  return (
    <svg viewBox="0 0 400 320" style={{ width: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <rect width="400" height="320" fill="#0e1712" />
      <ellipse cx="200" cy="160" rx="150" ry="120" fill="none" stroke="#2d6a4f" strokeWidth="2" />
      <ellipse cx="200" cy="160" rx="115" ry="90" fill="none" stroke="#2d6a4f" strokeWidth="1.5" />
      <ellipse cx="200" cy="160" rx="70" ry="52" fill="#1b2b22" stroke="#2d6a4f" strokeWidth="1.5" />
      <text x="200" y="164" textAnchor="middle" fill="#5b6b60" fontFamily="Archivo, sans-serif" fontSize="10" fontWeight="800" letterSpacing="2">
        STAGE / FLOOR
      </text>
      {/* entry doors, bottom */}
      <rect x="170" y="272" width="60" height="10" fill="#2d6a4f" />
      <text x="200" y="298" textAnchor="middle" fill="#5b6b60" fontFamily="Archivo, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.5">
        MAIN ENTRY
      </text>
      {/* exit doors, sides */}
      <rect x="18" y="90" width="10" height="50" fill="#2d6a4f" />
      <rect x="372" y="90" width="10" height="50" fill="#2d6a4f" />
      <text x="33" y="80" fill="#5b6b60" fontFamily="Archivo, sans-serif" fontSize="8" fontWeight="700" letterSpacing="1">
        EXIT
      </text>
      <text x="345" y="80" fill="#5b6b60" fontFamily="Archivo, sans-serif" fontSize="8" fontWeight="700" letterSpacing="1">
        EXIT
      </text>
    </svg>
  )
}
