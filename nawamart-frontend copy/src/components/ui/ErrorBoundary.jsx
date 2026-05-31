import { Component } from 'react'

/**
 * Global React Error Boundary
 * Catches any uncaught render errors and shows a friendly Arabic fallback.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Could send to Sentry / logging here
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 text-center"
        dir="rtl"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-danger-100 flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-danger"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Message */}
        <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="font-cairo text-sm text-text-muted mb-8 max-w-sm leading-relaxed">
          نعتذر عن هذا الخطأ. يرجى المحاولة مجدداً أو العودة للصفحة الرئيسية.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors"
          >
            العودة للرئيسية
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 font-cairo font-semibold text-sm px-5 py-2.5 rounded-xl border border-border text-text-muted hover:bg-bg-soft transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }
}
