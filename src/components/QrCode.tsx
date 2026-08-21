import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function QrCode({ value, size = 220, fg = '#201e1d', bg = '#ffffff' }: { value: string; size?: number; fg?: string; bg?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'M',
    }).catch(() => {})
  }, [value, size, fg, bg])

  return <canvas ref={ref} width={size} height={size} style={{ display: 'block', borderRadius: 8 }} />
}
