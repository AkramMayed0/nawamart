import { useState, useEffect } from 'react'
import { MessageCircle, Save, Settings2, ShoppingCart, ToggleLeft, ToggleRight, Phone, Clock, Percent } from 'lucide-react'
import { getWhatsAppSettings, updateWhatsAppSettings } from '@/api/whatsapp'
import toast from 'react-hot-toast'
import clsx from 'clsx'

import { useAuthStore } from '@/store/authStore'

export default function WhatsAppSettingsPage() {
  const storeId = useAuthStore(state => state.store?._id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    commerceBotEnabled: false,
    botGreeting: '',
    connectedPhone: '',
    cartRetrieverEnabled: false,
    abandonedCartDelayMinutes: 120,
    discountEnabled: false,
    discountPercent: 0,
    quietHours: { start: '', end: '' },
  })

  useEffect(() => {
    if (storeId) fetchSettings()
  }, [storeId])

  const fetchSettings = async () => {
    try {
      const res = await getWhatsAppSettings({ storeId })
      if (res.data?.data) {
        setSettings(res.data.data)
      }
    } catch {
      toast.error('فشل جلب إعدادات واتساب')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateWhatsAppSettings({ ...settings, storeId })
      toast.success('تم حفظ إعدادات واتساب بنجاح')
    } catch {
      toast.error('فشل حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 font-cairo h-full overflow-y-auto space-y-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-3 flex items-center gap-3">
              <MessageCircle size={32} className="text-white" />
              أتمتة واتساب (WhatsApp Automation)
            </h1>
            <p className="text-white/90 text-sm max-w-xl leading-relaxed">
              قم بإعداد بوت التجارة عبر واتساب للرد التلقائي، وفعل صائد السلات المهجورة لاستعادة عملائك المترددين تلقائياً.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 bg-white text-[#128C7E] px-8 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all shadow-sm flex items-center gap-2 justify-center"
          >
            {saving ? <div className="w-4 h-4 border-2 border-[#128C7E]/30 border-t-[#128C7E] rounded-full animate-spin" /> : <Save size={18} />}
            حفظ التغييرات
          </button>
        </div>
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commerce Bot Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Settings2 size={20} className="text-[#25D366]" />
              إعدادات بوت التجارة (Commerce Bot)
            </h2>
            <button
              onClick={() => handleChange('commerceBotEnabled', !settings.commerceBotEnabled)}
              className={clsx(
                'transition-colors',
                settings.commerceBotEnabled ? 'text-[#25D366]' : 'text-gray-300'
              )}
            >
              {settings.commerceBotEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          <div className={clsx('space-y-5 transition-all', !settings.commerceBotEnabled && 'opacity-50 pointer-events-none')}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                رقم واتساب المتصل
              </label>
              <input
                type="text"
                value={settings.connectedPhone || ''}
                onChange={(e) => handleChange('connectedPhone', e.target.value)}
                placeholder="مثال: +967700000000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all font-en"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-2">الرقم الذي سيتم ربط البوت به.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رسالة الترحيب التلقائية</label>
              <textarea
                rows={4}
                value={settings.botGreeting || ''}
                onChange={(e) => handleChange('botGreeting', e.target.value)}
                placeholder="أهلاً بك في متجرنا! كيف يمكننا مساعدتك اليوم؟"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">بداية وقت الراحة</label>
                <input
                  type="time"
                  value={settings.quietHours?.start || ''}
                  onChange={(e) => handleChange('quietHours', { ...settings.quietHours, start: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نهاية وقت الراحة</label>
                <input
                  type="time"
                  value={settings.quietHours?.end || ''}
                  onChange={(e) => handleChange('quietHours', { ...settings.quietHours, end: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Abandoned Cart Retriever Section */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-[#C93F2B]" />
              صائد السلات المهجورة
            </h2>
            <button
              onClick={() => handleChange('cartRetrieverEnabled', !settings.cartRetrieverEnabled)}
              className={clsx(
                'transition-colors',
                settings.cartRetrieverEnabled ? 'text-[#C93F2B]' : 'text-gray-300'
              )}
            >
              {settings.cartRetrieverEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          <div className={clsx('space-y-5 transition-all', !settings.cartRetrieverEnabled && 'opacity-50 pointer-events-none')}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                مدة الانتظار (بالدقائق)
              </label>
              <input
                type="number"
                min="15"
                value={settings.abandonedCartDelayMinutes}
                onChange={(e) => handleChange('abandonedCartDelayMinutes', Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C93F2B] focus:ring-1 focus:ring-[#C93F2B] transition-all font-en"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-2">الوقت الذي سينتظره النظام قبل إرسال رسالة تذكير للعميل.</p>
            </div>

            <div className="pt-4 border-t border-gray-50 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-700">تفعيل كود الخصم في الرسالة</label>
                <button
                  onClick={() => handleChange('discountEnabled', !settings.discountEnabled)}
                  className={clsx(
                    'transition-colors',
                    settings.discountEnabled ? 'text-[#C93F2B]' : 'text-gray-300'
                  )}
                >
                  {settings.discountEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              {settings.discountEnabled && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Percent size={16} className="text-gray-400" />
                    نسبة الخصم المئوية (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={settings.discountPercent}
                    onChange={(e) => handleChange('discountPercent', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C93F2B] focus:ring-1 focus:ring-[#C93F2B] transition-all font-en"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-2">سيتم إرسال كود خصم بهذه النسبة لتشجيع العميل على إتمام الشراء.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
