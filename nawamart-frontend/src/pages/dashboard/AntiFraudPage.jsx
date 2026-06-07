import { useState, useEffect } from 'react'
import { Search, AlertTriangle, ShieldAlert, CheckCircle, Shield, Phone, History, Loader } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AntiFraudPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [myReports, setMyReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)

  // Report Form state
  const [reportPhone, setReportPhone] = useState('')
  const [reportSeverity, setReportSeverity] = useState('medium')
  const [reportNotes, setReportNotes] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)

  const store = useAuthStore(s => s.store)

  useEffect(() => {
    fetchMyReports()
  }, [])

  const fetchMyReports = async () => {
    try {
      const res = await api.get('/anti-fraud')
      setMyReports(res.data.data ?? [])
    } catch {
      // toast.error('فشل جلب قائمة المرتجعات الخاصة بك')
    } finally {
      setReportsLoading(false)
    }
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await api.get(`/anti-fraud/check/${query}`)
      setResult(res.data.data)
    } catch {
      toast.error('فشل فحص الرقم')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!reportPhone.trim()) return

    setReportSubmitting(true)
    try {
      await api.post('/anti-fraud/report', {
        customerPhone: reportPhone,
        severity: reportSeverity,
        notes: reportNotes
      })
      toast.success('تم الإبلاغ بنجاح')
      setReportPhone('')
      setReportNotes('')
      fetchMyReports()
    } catch {
      toast.error('فشل إرسال البلاغ')
    } finally {
      setReportSubmitting(false)
    }
  }

  if (store?.type !== 'physical' || store?.subscription?.plan !== 'business') {
    return (
      <div className="p-8 font-cairo h-full flex flex-col items-center justify-center text-center">
        <Shield size={64} className="text-[#E1DED8] mb-4" />
        <h2 className="text-xl font-bold text-[#1D2430] mb-2">درع المرتجعات ومكافحة الاحتيال</h2>
        <p className="text-sm text-[#5F6673] max-w-md">
          هذه الميزة متاحة فقط للمتاجر المادية على باقة (Business). تتيح لك التحقق من سجل المرتجعات للعملاء عبر شبكة مشتركة.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 font-cairo h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#18212F] to-[#27364B] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black mb-2 flex items-center gap-2">
              <ShieldAlert size={24} className="text-[#C93F2B]" />
              درع المرتجعات المشترك
            </h1>
            <p className="text-white/80 text-sm max-w-lg">
              ابحث عن رقم العميل للتحقق من سجله في المرتجعات الغير مبررة أو الاحتيال على مستوى جميع المتاجر.
            </p>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#C93F2B]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Check and Report */}
        <div className="space-y-6">
          {/* Check Form */}
          <div className="bg-white rounded-2xl border border-[#E1DED8] p-5 shadow-sm">
            <h2 className="font-bold text-lg text-[#1D2430] mb-4 flex items-center gap-2">
              <Search size={18} className="text-[#9298A3]" />
              فحص رقم العميل
            </h2>
            <form onSubmit={handleCheck} className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-[#9298A3]" />
                <input
                  type="text"
                  placeholder="مثال: 770000000"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 bg-[#F6F3EE] border border-[#E1DED8] rounded-xl text-sm focus:outline-none focus:border-[#18212F]/40 font-en"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query}
                className="bg-[#18212F] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#27364B] transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري الفحص...' : 'فحص'}
              </button>
            </form>

            {/* Check Result */}
            {result && (
              <div className={clsx(
                'mt-4 rounded-xl p-4 border',
                result.riskScore === 0 ? 'bg-emerald-50 border-emerald-100' :
                result.riskScore < 50 ? 'bg-amber-50 border-amber-100' :
                'bg-red-50 border-red-100'
              )}>
                <div className="flex items-start gap-3">
                  {result.riskScore === 0 ? (
                    <CheckCircle size={24} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={24} className={result.riskScore < 50 ? 'text-amber-500' : 'text-red-500 shrink-0'} />
                  )}
                  <div>
                    <h3 className={clsx(
                      'font-bold text-base mb-1',
                      result.riskScore === 0 ? 'text-emerald-700' :
                      result.riskScore < 50 ? 'text-amber-700' :
                      'text-red-700'
                    )}>
                      {result.riskScore === 0 ? 'رقم آمن' :
                       result.riskScore < 50 ? 'تنبيه: سجل مرتجعات متوسط' :
                       'تحذير: سجل مرتجعات عالي الخطورة!'}
                    </h3>
                    <p className="text-sm font-semibold mb-2">مؤشر الخطورة: {result.riskScore}%</p>
                    
                    {result.sharedHistory?.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <p className="text-xs font-bold text-gray-600">البلاغات السابقة:</p>
                        {result.sharedHistory.map((h, i) => (
                          <div key={i} className="bg-white/60 p-2 rounded text-xs border border-white/40">
                            <span className={clsx(
                              'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ml-2',
                              h.severity === 'high' ? 'bg-red-100 text-red-700' :
                              h.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            )}>
                              {h.severity === 'high' ? 'عالي' : h.severity === 'medium' ? 'متوسط' : 'منخفض'}
                            </span>
                            <span className="text-gray-700">{h.notes}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">لا توجد بلاغات مسجلة ضد هذا الرقم.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Form */}
          <div className="bg-white rounded-2xl border border-[#E1DED8] p-5 shadow-sm">
            <h2 className="font-bold text-lg text-[#1D2430] mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#C93F2B]" />
              الإبلاغ عن عميل
            </h2>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5F6673] mb-1">رقم هاتف العميل</label>
                <input
                  type="text"
                  required
                  value={reportPhone}
                  onChange={(e) => setReportPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F3EE] border border-[#E1DED8] rounded-xl text-sm focus:outline-none focus:border-[#18212F]/40"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5F6673] mb-1">مستوى الخطورة</label>
                <select
                  value={reportSeverity}
                  onChange={(e) => setReportSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F3EE] border border-[#E1DED8] rounded-xl text-sm focus:outline-none focus:border-[#18212F]/40"
                >
                  <option value="low">منخفض (إلغاء عند الوصول)</option>
                  <option value="medium">متوسط (مرتجعات متكررة غير مبررة)</option>
                  <option value="high">عالي (احتيال أو رفض دفع متكرر)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5F6673] mb-1">تفاصيل البلاغ (ملاحظات)</label>
                <textarea
                  required
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F3EE] border border-[#E1DED8] rounded-xl text-sm focus:outline-none focus:border-[#18212F]/40 resize-none"
                  placeholder="الرجاء توضيح سبب الإبلاغ بدقة..."
                />
              </div>
              <button
                type="submit"
                disabled={reportSubmitting}
                className="w-full bg-[#C93F2B] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#A33222] transition-colors disabled:opacity-50"
              >
                {reportSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ للقائمة المشتركة'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: My Reports */}
        <div className="bg-white rounded-2xl border border-[#E1DED8] p-5 shadow-sm h-[600px] flex flex-col">
          <h2 className="font-bold text-lg text-[#1D2430] mb-4 flex items-center gap-2 shrink-0">
            <History size={18} className="text-[#9298A3]" />
            بلاغاتي السابقة
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {reportsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader className="animate-spin text-[#9298A3]" />
              </div>
            ) : myReports.length === 0 ? (
              <div className="text-center py-12">
                <Shield size={32} className="text-[#E1DED8] mx-auto mb-2" />
                <p className="text-sm text-[#5F6673]">لم تقم بتسجيل أي بلاغات حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReports.map((report) => (
                  <div key={report._id} className="p-3 border border-[#E1DED8] rounded-xl bg-[#F6F3EE]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold font-en text-sm" dir="ltr">{report.customerPhone}</span>
                      <span className={clsx(
                        'text-[10px] px-2 py-0.5 rounded-full font-bold',
                        report.severity === 'high' ? 'bg-red-100 text-red-700' :
                        report.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-200 text-gray-700'
                      )}>
                        {report.severity === 'high' ? 'عالي' : report.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6673] line-clamp-2">{report.notes}</p>
                    <p className="text-[10px] text-[#9298A3] mt-2 font-en">
                      {new Date(report.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
