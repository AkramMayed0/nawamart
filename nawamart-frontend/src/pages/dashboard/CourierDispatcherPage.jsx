import { useState, useEffect } from 'react'
import { Navigation, Plus, MapPin, Truck, CheckCircle, Search, Copy, User, Phone, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { listCouriers, createCourier, listDispatches, assignDispatch, sendToPool } from '@/api/courier'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CourierDispatcherPage() {
  const store = useAuthStore(s => s.store)
  const [couriers, setCouriers] = useState([])
  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)

  // Courier Form State
  const [showAddCourier, setShowAddCourier] = useState(false)
  const [courierForm, setCourierForm] = useState({ name: '', phone: '', vehicleType: 'motorbike', notes: '' })
  const [submittingCourier, setSubmittingCourier] = useState(false)

  // Dispatch Form State
  const [showAssignDispatch, setShowAssignDispatch] = useState(false)
  const [dispatchMode, setDispatchMode] = useState('pool') // 'pool' or 'direct'
  const [dispatchForm, setDispatchForm] = useState({ orderId: '', courierId: '', notes: '' })
  const [submittingDispatch, setSubmittingDispatch] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cRes, dRes] = await Promise.all([
        listCouriers({ storeId: store?._id }),
        listDispatches({ storeId: store?._id })
      ])
      setCouriers(cRes.data?.data ?? [])
      setDispatches(dRes.data?.data ?? [])
    } catch {
      toast.error('فشل جلب بيانات المناديب والرحلات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourier = async (e) => {
    e.preventDefault()
    setSubmittingCourier(true)
    try {
      await createCourier({ ...courierForm, storeId: store?._id })
      toast.success('تمت إضافة المندوب بنجاح')
      setShowAddCourier(false)
      setCourierForm({ name: '', phone: '', vehicleType: 'motorbike', notes: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إضافة المندوب')
    } finally {
      setSubmittingCourier(false)
    }
  }

  const handleAssignDispatch = async (e) => {
    e.preventDefault()
    setSubmittingDispatch(true)
    try {
      if (dispatchMode === 'pool') {
        await sendToPool({ orderId: dispatchForm.orderId, storeId: store?._id })
        toast.success('تمت إضافة الطلب لطلبات التوصيل المتاحة')
      } else {
        await assignDispatch({ ...dispatchForm, storeId: store?._id })
        toast.success('تم إسناد الطلب بنجاح وتم إنشاء رابط التتبع')
      }
      setShowAssignDispatch(false)
      setDispatchForm({ orderId: '', courierId: '', notes: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل التوجيه')
    } finally {
      setSubmittingDispatch(false)
    }
  }

  const copyToClipboard = (text, message = 'تم نسخ الرابط') => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const copyAppURL = (courierId) => {
    const url = `${window.location.origin}/courier-portal/${courierId}`
    copyToClipboard(url, 'تم نسخ رابط تطبيق المندوب')
  }

  if (store?.type !== 'physical' || store?.plan !== 'business') {
    return (
      <div className="p-8 font-cairo h-full flex flex-col items-center justify-center text-center">
        <Navigation size={64} className="text-[#E1DED8] mb-4" />
        <h2 className="text-xl font-bold text-[#1D2430] mb-2">إدارة المناديب وتوجيه الطلبات</h2>
        <p className="text-sm text-[#5F6673] max-w-md">
          هذه الميزة متاحة فقط للمتاجر المادية على باقة (Business). تتيح لك إدارة أسطول المناديب المحلي وتتبعهم بروابط خفيفة.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 font-cairo h-full overflow-y-auto space-y-6 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#18212F] to-[#27364B] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Truck size={32} className="text-[#38BDF8]" />
              لوحة التحكم والمناديب
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              إدارة المناديب المحليين، إسناد الطلبات، واستخراج الروابط الخفيفة للخرائط لتوجيههم بكل سهولة.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCourier(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <User size={16} />
              إضافة مندوب
            </button>
            <button
              onClick={() => setShowAssignDispatch(true)}
              className="bg-[#38BDF8] hover:bg-[#0284C7] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Navigation size={16} />
              توجيه طلب
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Couriers Column */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm lg:col-span-1 flex flex-col">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-[#38BDF8]" />
            المناديب المسجلين
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : couriers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">لا يوجد مناديب مضافين بعد.</p>
            ) : (
              couriers.map(courier => (
                <div key={courier._id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    {courier.vehicleType === 'motorbike' ? <Truck size={18} className="text-[#18212F]" /> : <User size={18} className="text-[#18212F]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{courier.name}</h3>
                    <p className="text-xs text-gray-500 font-en mt-0.5">{courier.phone}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={clsx(
                        'w-2 h-2 rounded-full',
                        courier.currentStatus === 'available' ? 'bg-[#25D366]' :
                        courier.currentStatus === 'busy' ? 'bg-amber-500' : 'bg-gray-300'
                      )} />
                      <span className="text-[10px] font-bold text-gray-600">
                        {courier.currentStatus === 'available' ? 'متاح' : courier.currentStatus === 'busy' ? 'مشغول' : 'غير متصل'}
                      </span>
                    </div>
                    <button 
                      onClick={() => copyAppURL(courier._id)}
                      className="text-[10px] font-bold text-[#38BDF8] hover:text-[#0284C7] bg-[#38BDF8]/10 px-2 py-1 rounded transition-colors"
                    >
                      نسخ رابط التطبيق
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dispatches Column */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-[#38BDF8]" />
            الرحلات الجارية
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-12">
                <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">لا توجد رحلات توجيه حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dispatches.map(dispatch => (
                  <div key={dispatch._id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={clsx(
                      'absolute top-0 right-0 w-1 h-full',
                      dispatch.status === 'assigned' ? 'bg-amber-500' :
                      dispatch.status === 'picked_up' ? 'bg-blue-500' :
                      dispatch.status === 'delivered' ? 'bg-[#25D366]' : 'bg-red-500'
                    )} />
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">طلب رقم</p>
                        <p className="font-bold text-sm text-[#1D2430] font-en">#{String(dispatch.order?._id || dispatch.order).slice(-8).toUpperCase()}</p>
                      </div>
                      <span className={clsx(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        dispatch.status === 'assigned' ? 'bg-amber-50 text-amber-700' :
                        dispatch.status === 'picked_up' ? 'bg-blue-50 text-blue-700' :
                        dispatch.status === 'delivered' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-red-50 text-red-700'
                      )}>
                        {dispatch.status === 'assigned' ? 'تم التوجيه' :
                         dispatch.status === 'picked_up' ? 'تم الاستلام' :
                         dispatch.status === 'delivered' ? 'مكتمل' : 'ملغي'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate">{dispatch.courier?.name || 'غير معروف'}</p>
                        <p className="text-[10px] text-gray-500 font-en">{dispatch.courier?.phone || ''}</p>
                      </div>
                    </div>

                    {dispatch.lightweightMapUrl && (
                      <div className="pt-3 border-t border-gray-50 flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={dispatch.lightweightMapUrl}
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[10px] font-en text-gray-500 focus:outline-none"
                          dir="ltr"
                        />
                        <button
                          onClick={() => copyToClipboard(dispatch.lightweightMapUrl)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                          title="نسخ الرابط الخفيف"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddCourier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">إضافة مندوب جديد</h3>
              <button onClick={() => setShowAddCourier(false)} className="text-gray-400 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCourier} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المندوب</label>
                <input required type="text" value={courierForm.name} onChange={e => setCourierForm(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الهاتف</label>
                <input required type="text" value={courierForm.phone} onChange={e => setCourierForm(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary font-en" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">نوع المركبة</label>
                <select value={courierForm.vehicleType} onChange={e => setCourierForm(p => ({...p, vehicleType: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option value="motorbike">دراجة نارية (موتور)</option>
                  <option value="car">سيارة</option>
                  <option value="walking">مشياً</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <button type="submit" disabled={submittingCourier} className="w-full bg-[#18212F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#27364B] transition-colors disabled:opacity-50 mt-2">
                {submittingCourier ? 'جاري الحفظ...' : 'حفظ المندوب'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showAssignDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">إسناد وتوجيه طلب</h3>
              <button onClick={() => setShowAssignDispatch(false)} className="text-gray-400 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleAssignDispatch} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">طريقة التوجيه</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setDispatchMode('pool')} className={clsx("flex-1 py-2 text-sm font-bold rounded-xl border transition-colors", dispatchMode === 'pool' ? "bg-[#38BDF8] text-white border-[#38BDF8]" : "bg-gray-50 text-gray-500 border-gray-200")}>إتاحة للجميع</button>
                  <button type="button" onClick={() => setDispatchMode('direct')} className={clsx("flex-1 py-2 text-sm font-bold rounded-xl border transition-colors", dispatchMode === 'direct' ? "bg-[#18212F] text-white border-[#18212F]" : "bg-gray-50 text-gray-500 border-gray-200")}>إسناد مباشر</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">رقم الطلب (ID)</label>
                <input required type="text" placeholder="انسخ معرف الطلب هنا..." value={dispatchForm.orderId} onChange={e => setDispatchForm(p => ({...p, orderId: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#38BDF8] font-en" dir="ltr" />
              </div>
              {dispatchMode === 'direct' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">المندوب</label>
                    <select required value={dispatchForm.courierId} onChange={e => setDispatchForm(p => ({...p, courierId: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#38BDF8]">
                      <option value="" disabled>اختر المندوب...</option>
                      {couriers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات للمندوب</label>
                    <textarea rows={2} value={dispatchForm.notes} onChange={e => setDispatchForm(p => ({...p, notes: e.target.value}))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#38BDF8] resize-none" placeholder="مثال: العميل بانتظارك عند الباب..." />
                  </div>
                </>
              )}
              <button type="submit" disabled={submittingDispatch || !dispatchForm.orderId || (dispatchMode === 'direct' && !dispatchForm.courierId)} className="w-full bg-[#38BDF8] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0284C7] transition-colors disabled:opacity-50 mt-2">
                {submittingDispatch ? 'جاري الإرسال...' : dispatchMode === 'pool' ? 'إرسال لطلبات التوصيل المتاحة' : 'إسناد مباشر للمندوب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
