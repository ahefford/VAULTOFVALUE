import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100dvh', background: 'var(--zc-bg)', color: 'var(--zc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', color: 'var(--zc-red)' }}>SOMETHING WENT WRONG</div>
            <div style={{ fontSize: 13, marginTop: 10, lineHeight: 1.5, color: 'var(--zc-muted-2)' }}>{this.state.error.message}</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
