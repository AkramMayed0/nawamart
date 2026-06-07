import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Package, Navigation, CheckCircle, MapPin, Loader, Clock, AlertCircle } from 'lucide-react'
import { getCourierPortalAvailable, getCourierPortalTasks, acceptCourierTask, updateCourierTaskStatus } from '@/api/courier'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CourierPortalPage() {
  const { courierId } = useParams()
  const [activeTab, setActiveTab] = useState('available') // 'available' or 'tasks'
  const [availableOrders, setAvailableOrders] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'available') {
        const res = await getCourierPortalAvailable(courierId)
        setAvailableOrders(res.data?.data || [])
      } else {
        const res = await getCourierPortalTasks(courierId)
        setTasks(res.data?.data || [])
      }
    } catch (err) {
      toast.error('فشل جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (orderId) => {
    try {
      await acceptCourierTask(courierId, { orderId })
      toast.success('تم استلام الطلب بنجاح!')
      // Switch to tasks tab
      setActiveTab('tasks')
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل استلام الطلب')
      fetchData() // Refresh list
    }
  }

  const handleUpdateStatus = async (dispatchId, newStatus) => {
    try {
      await updateCourierTaskStatus(courierId, dispatchId, newStatus)
      toast.success('تم تحديث حالة الطلب')
      fetchData()
    } catch (err) {
      toast.error('فشل تحديث الحالة')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-YE', {
      style: 'currency',
      currency: 'YER',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const openMap = (lat, lng, address) => {
    let url = ''
    if (lat && lng) {
      url = `https://www.google.com/maps?q=${lat},${lng}`
    } else if (address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    }
    if (url) window.open(url, '_blank')
    else toast.error('موقع العميل غير متوفر')
  }

  return (
    <div className="min-h-screen bg-[#F6F3EE] font-cairo pb-20">
      {/* Header */}
      <div className="bg-[#18212F] text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
          <Navigation size={24} className="text-[#38BDF8]" />
          بوابة المندوب
        </h1>
        <p className="text-sm text-white/70">مرحباً بك، قم بإدارة طلبات التوصيل الخاصة بك</p>
      </div>

      {/* Tabs */}
      <div className="flex px-4 mt-6 gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2',
            activeTab === 'available' 
              ? 'bg-[#38BDF8] text-white shadow-md' 
              : 'bg-white text-gray-500 border border-gray-200'
          )}
        >
          <Clock size={16} />
          الطلبات المتاحة
          {activeTab !== 'available' && availableOrders.length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              {availableOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={clsx(
            'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2',
            activeTab === 'tasks' 
              ? 'bg-[#18212F] text-white shadow-md' 
              : 'bg-white text-gray-500 border border-gray-200'
          )}
        >
          <Package size={16} />
          مهامي الحالية
        </button>
      </div>

      {/* Content */}
      <div className="p-4 mt-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-[#38BDF8]" size={32} />
          </div>
        ) : activeTab === 'available' ? (
          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="font-bold text-gray-600">لا توجد طلبات متاحة حالياً</p>
                <p className="text-xs text-gray-400 mt-1">سيتم تحديث القائمة تلقائياً عند وصول طلبات جديدة</p>
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-[#38BDF8]" />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">طلب رقم</p>
                      <p className="font-bold font-en text-sm text-[#18212F]">#{String(order._id).slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-0.5">المبلغ المطلوب</p>
                      <p className="font-bold text-[#18212F]">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-700">{order.deliveryAddress?.city} - {order.deliveryAddress?.district}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{order.deliveryAddress?.details}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(order._id)}
                    className="w-full bg-[#38BDF8] hover:bg-[#0284C7] text-white py-3 rounded-xl font-bold text-sm transition-colors"
                  >
                    قبول وتوصيل الطلب
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <CheckCircle size={48} className="text-emerald-300 mx-auto mb-3" />
                <p className="font-bold text-gray-600">ليس لديك أي مهام حالية</p>
                <p className="text-xs text-gray-400 mt-1">اذهب إلى الطلبات المتاحة لاستلام طلب جديد</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className={clsx(
                  "bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden",
                  task.status === 'delivered' ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100'
                )}>
                  <div className={clsx(
                    "absolute top-0 right-0 w-1 h-full",
                    task.status === 'assigned' ? 'bg-amber-500' :
                    task.status === 'picked_up' ? 'bg-blue-500' :
                    task.status === 'delivered' ? 'bg-emerald-500' : 'bg-red-500'
                  )} />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">طلب رقم</p>
                      <p className="font-bold font-en text-sm text-[#18212F]">#{String(task.order?._id).slice(-6).toUpperCase()}</p>
                    </div>
                    <span className={clsx(
                      'text-[10px] font-bold px-2 py-1 rounded-full',
                      task.status === 'assigned' ? 'bg-amber-50 text-amber-700' :
                      task.status === 'picked_up' ? 'bg-blue-50 text-blue-700' :
                      task.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    )}>
                      {task.status === 'assigned' ? 'بانتظار الاستلام' :
                       task.status === 'picked_up' ? 'جاري التوصيل' :
                       task.status === 'delivered' ? 'تم التوصيل بنجاح' : 'ملغي'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                     <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-gray-400" />
                       <span className="text-xs font-bold text-gray-700">{task.dropoff?.address || 'بدون عنوان'}</span>
                     </div>
                     <button
                        onClick={() => openMap(task.dropoff?.lat, task.dropoff?.lng, task.dropoff?.address)}
                        className="text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1.5 rounded-lg"
                     >
                       عرض الخريطة
                     </button>
                  </div>

                  {task.status !== 'delivered' && task.status !== 'cancelled' && (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                      {task.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'picked_up')}
                          className="col-span-2 bg-[#18212F] text-white py-2.5 rounded-xl font-bold text-sm"
                        >
                          تأكيد استلام الطلب من المتجر
                        </button>
                      )}
                      {task.status === 'picked_up' && (
                        <button
                          onClick={() => handleUpdateStatus(task._id, 'delivered')}
                          className="col-span-2 bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          تم تسليم الطلب للعميل
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
