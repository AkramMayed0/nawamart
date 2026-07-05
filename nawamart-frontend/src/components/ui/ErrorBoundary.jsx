import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
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
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-bg via-white to-bg px-4 text-center"
        dir="rtl"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-danger-100 to-red-100 flex items-center justify-center mb-6 shadow-lg">
          <AlertTriangle size={36} className="text-danger" />
        </div>

        <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">
          حدث خطأ غير متوقع
        </h1>
        <p className="font-cairo text-sm text-text-muted mb-8 max-w-sm leading-relaxed">
          نعتذر عن هذا الخطأ. يرجى المحاولة مجدداً أو العودة للصفحة الرئيسية.
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-700 hover:-translate-y-0.5 transition-all shadow-md shadow-primary/15"
          >
            <Home size={16} />
            العودة للرئيسية
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 font-cairo font-semibold text-sm px-6 py-3 rounded-xl border border-border text-text-muted hover:bg-white hover:text-text hover:shadow-sm transition-all"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }
}
