import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Users, UserPlus, Shield, Trash2, X } from 'lucide-react'
import { getStaffList, addStaff, updateStaff, removeStaff } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import usePageTitle from '@/hooks/usePageTitle'

const ROLE_LABELS = {
  store_owner: 'مالك المتجر',
  store_manager: 'مدير المتجر',
  staff: 'موظف',
  designer: 'مصمم',
  content_editor: 'محرر محتوى',
  viewer: 'مشاهد',
}

const ROLE_COLORS = {
  store_owner: 'bg-purple-100 text-purple-700',
  store_manager: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700',
  designer: 'bg-pink-100 text-pink-700',
  content_editor: 'bg-amber-100 text-amber-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const ROLE_DESCRIPTIONS = {
  store_manager: 'إدارة المنتجات، الطلبات، العملاء، وعرض الموظفين',
  staff: 'معالجة الطلبات وإدارة العملاء',
  designer: 'تعديل مظهر المتجر والمنتجات',
  content_editor: 'إدارة المنتجات والمحتوى',
  viewer: 'عرض فقط — لا يمكن التعديل',
}

const ASSIGNABLE_ROLES = ['store_manager', 'staff', 'designer', 'content_editor', 'viewer']

export default function StaffPage() {
  const store = useAuthStore((s) => s.store)
  const storeId = Array.isArray(store) ? store[0]?._id : store?._id

  const [staffList, setStaffList] = useState([])
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('staff')
  const [addLoading, setAddLoading] = useState(false)

  usePageTitle('إدارة الموظفين')

  useEffect(() => {
    if (storeId) loadStaff()
  }, [storeId])

  async function loadStaff() {
    if (!storeId) return
    try {
      setLoading(true)
      const res = await getStaffList(storeId)
      setOwner(res.data.data.owner)
      setStaffList(res.data.data.staff || [])
    } catch (err) {
      toast.error(err?.message || 'فشل جلب قائمة الموظفين')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newEmail.trim()) {
      toast.error('البريد الإلكتروني مطلوب')
      return
    }
    setAddLoading(true)
    try {
      await addStaff(storeId, { email: newEmail.trim(), role: newRole })
      toast.success('تم إضافة الموظف بنجاح')
      setNewEmail('')
      setNewRole('staff')
      setShowAddForm(false)
      loadStaff()
    } catch (err) {
      toast.error(err?.message || 'فشل إضافة الموظف')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRoleChange(staffId, newRole) {
    try {
      await updateStaff(storeId, staffId, { role: newRole })
      toast.success('تم تحديث صلاحية الموظف')
      loadStaff()
    } catch (err) {
      toast.error(err?.message || 'فشل تحديث الصلاحية')
    }
  }

  async function handleRemove(staffId, name) {
    if (!window.confirm(`هل أنت متأكد من إزالة "${name}" من فريق المتجر؟`)) return
    try {
      await removeStaff(storeId, staffId)
      toast.success('تم إزالة الموظف')
      loadStaff()
    } catch (err) {
      toast.error(err?.message || 'فشل إزالة الموظف')
    }
  }

  if (!storeId) {
    return (
      <div className="p-6 text-center font-cairo text-text-muted" dir="rtl">
        يرجى إنشاء متجر أولاً
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cairo font-bold text-2xl text-text mb-1">فريق المتجر</h1>
          <p className="font-cairo text-sm text-text-muted">إدارة صلاحيات الموظفين والوصول إلى المتجر</p>
        </div>
        {!showAddForm && (
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
            <UserPlus size={16} className="ml-1.5" />
            إضافة موظف
          </Button>
        )}
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-6 relative">
          <button
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 left-4 p-1 rounded-lg hover:bg-bg-soft text-text-muted"
          >
            <X size={18} />
          </button>
          <h3 className="font-cairo font-bold text-lg text-text mb-4">إضافة موظف جديد</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <Input
              label="البريد الإلكتروني للموظف"
              type="email"
              placeholder="staff@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={addLoading}
            />
            <div>
              <label className="block font-cairo text-sm font-semibold text-text mb-2">الصلاحية</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-2.5 font-cairo text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={addLoading}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]} — {ROLE_DESCRIPTIONS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={addLoading} disabled={addLoading}>
                إضافة
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-border p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Owner (always shown) */}
          {owner && (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-cairo font-semibold text-sm text-text truncate">{owner.name}</p>
                    <p className="font-cairo text-xs text-text-muted truncate">{owner.email}</p>
                  </div>
                </div>
                <span className={`font-cairo text-xs font-bold px-3 py-1 rounded-full shrink-0 ${ROLE_COLORS.store_owner}`}>
                  {ROLE_LABELS.store_owner}
                </span>
              </div>
            </div>
          )}

          {/* Staff Members */}
          {staffList.map((staff) => (
            <div key={staff._id} className="bg-white rounded-2xl shadow-sm border border-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-bg-soft flex items-center justify-center shrink-0">
                    <Users size={18} className="text-text-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-cairo font-semibold text-sm text-text truncate">{staff.user?.name || '—'}</p>
                    <p className="font-cairo text-xs text-text-muted truncate">{staff.user?.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={staff.role}
                    onChange={(e) => handleRoleChange(staff._id, e.target.value)}
                    className="rounded-xl border border-border bg-white px-3 py-1.5 font-cairo text-xs font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(staff._id, staff.user?.name)}
                    className="p-2 rounded-xl hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                    title="إزالة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {staffList.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-10 text-center">
              <Users size={40} className="mx-auto text-text-muted mb-3" />
              <p className="font-cairo text-text-muted">لا يوجد موظفون بعد</p>
              <p className="font-cairo text-sm text-text-subtle mt-1">أضف موظفين لمساعدتك في إدارة المتجر</p>
            </div>
          )}
        </div>
      )}

      {/* Roles info */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-border p-5">
        <h3 className="font-cairo font-bold text-sm text-text mb-3">الصلاحيات المتاحة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSIGNABLE_ROLES.map((role) => (
            <div key={role} className="flex items-start gap-3 p-3 rounded-xl bg-bg-soft">
              <span className={`font-cairo text-xs font-bold px-2 py-1 rounded-full shrink-0 ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
              <p className="font-cairo text-xs text-text-muted">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
