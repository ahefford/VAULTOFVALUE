import { useEffect, useRef, useState } from 'react'
import { IconClose } from './icons'

export function ScannerCamera({ onResult, onClose }: { onResult: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [supported] = useState(() => typeof window !== 'undefined' && !!window.BarcodeDetector)

  useEffect(() => {
    if (!supported) {
      setError('Live QR scanning is not supported in this browser. Use manual entry below.')
      return
    }
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        const detector = new window.BarcodeDetector!({ formats: ['qr_code'] })
        const loop = async () => {
          if (stopped || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              onResult(codes[0].rawValue)
              return
            }
          } catch {
            // transient decode error, keep looping
          }
          raf = requestAnimationFrame(loop)
        }
        raf = requestAnimationFrame(loop)
      } catch {
        setError('Camera access was denied or unavailable. Use manual entry below.')
      }
    }
    start()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult, supported])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'calc(var(--safe-top) + 12px) 16px 12px' }}>
        <button type="button" onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 999, padding: 8, cursor: 'pointer', color: '#fff' }}>
          <IconClose />
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {supported ? (
          <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ color: '#fff', textAlign: 'center', padding: 24, font: '400 15px/1.4 var(--font-body)' }}>{error}</div>
        )}
        {supported && (
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              border: '2px solid var(--color-process-yellow)',
              borderRadius: 16,
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
            }}
          />
        )}
      </div>
      {error && supported === false && null}
      {error && supported && (
        <div style={{ color: '#fff', textAlign: 'center', padding: 16, font: '400 14px/1.4 var(--font-body)' }}>{error}</div>
      )}
      <div style={{ padding: '10px 20px calc(20px + var(--safe-bottom))', color: 'rgba(255,255,255,0.7)', textAlign: 'center', font: '400 13px/1.4 var(--font-body)' }}>
        Point the camera at a badge QR code.
      </div>
    </div>
  )
}
