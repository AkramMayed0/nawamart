import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Smartphone, Monitor, Globe, XCircle, LogOut } from 'lucide-react'
import { listSessions, revokeSession } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

import usePageTitle from '@/hooks/usePageTitle'

function getDeviceIcon(deviceInfo) {
  if (!deviceInfo) return <Globe size={20} />
  const ua = deviceInfo.toLowerCase()
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return <Smartphone size={20} />
  }
  return <Monitor size={20} />
}

function truncateUA(ua, maxLen = 60) {
  if (!ua) return 'جهاز غير معروف'
  if (ua.length <= maxLen) return ua
  return ua.slice(0, maxLen) + '…'
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SessionsPage() {
  const token = useAuthStore((s) => s.token)

  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  usePageTitle('الجلسات النشطة')

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    try {
      setLoading(true)
      const res = await listSessions()
      setSessions(res.data.data || [])
    } catch (err) {
      toast.error(err?.message || 'فشل جلب الجلسات')
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(sessionId) {
    try {
      await revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s._id !== sessionId))
      toast.success('تم إنهاء الجلسة')
    } catch (err) {
      toast.error(err?.message || 'فشل إنهاء الجلسة')
    }
  }

  function isCurrentSession(session) {
    const stored = useAuthStore.getState()
    return session.refreshToken === stored.refreshToken || session._id === stored.sessionId
  }

  return (
    <div className="p-6 max-w-3xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="font-cairo font-bold text-2xl text-text mb-1">الجلسات النشطة</h1>
        <p className="font-cairo text-sm text-text-muted">
          الأجهزة المتصلة بحسابك حالياً
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-border p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center">
          <LogOut size={40} className="mx-auto text-text-muted mb-3" />
          <p className="font-cairo text-text-muted">لا توجد جلسات نشطة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const current = isCurrentSession(session)
            return (
              <div
                key={session._id}
                className={`bg-white rounded-2xl shadow-sm border p-5 transition-colors ${
                  current ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center shrink-0 text-text-muted">
                      {getDeviceIcon(session.deviceInfo)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-cairo font-semibold text-sm text-text truncate">
                          {truncateUA(session.deviceInfo)}
                        </p>
                        {current && (
                          <span className="text-[10px] font-cairo font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            هذه الجلسة
                          </span>
                        )}
                      </div>
                      <p className="font-cairo text-xs text-text-muted mt-1">
                        {session.ip && (
                          <>
                            <span className="font-en">{session.ip}</span>
                            <span className="mx-1.5">·</span>
                          </>
                        )}
                        آخر نشاط: {formatDate(session.lastActivity)}
                      </p>
                      <p className="font-cairo text-xs text-text-subtle mt-0.5">
                        تاريخ الإنشاء: {formatDate(session.createdAt)}
                        <span className="mx-1.5">·</span>
                        تنتهي: {formatDate(session.expiresAt)}
                      </p>
                    </div>
                  </div>
                  {!current && (
                    <button
                      onClick={() => handleRevoke(session._id)}
                      className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors shrink-0"
                      title="إنهاء الجلسة"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-border p-5">
        <h3 className="font-cairo font-bold text-sm text-text mb-2">معلومات الأمان</h3>
        <ul className="font-cairo text-xs text-text-muted space-y-1.5">
          <li>• يمكنك تسجيل الدخول من 5 أجهزة كحد أقصى في نفس الوقت</li>
          <li>• إذا تجاوزت الحد، سيتم إنهاء أقدم جلسة تلقائياً</li>
          <li>• الجلسات تنتهي تلقائياً بعد 7 أيام من عدم النشاط</li>
          <li>• قم بإنهاء أي جلسة لا تعرفها فوراً لحماية حسابك</li>
        </ul>
      </div>
    </div>
  )
}
