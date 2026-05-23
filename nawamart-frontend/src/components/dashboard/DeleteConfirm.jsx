import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

export default function DeleteConfirm({ open, onClose, onConfirm, productName, loading }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-danger-100 flex items-center justify-center">
          <Icon name="trash" size={26} className="text-danger" />
        </div>
        <div>
          <h3 className="font-cairo font-bold text-lg text-text mb-1">حذف المنتج</h3>
          <p className="font-cairo text-sm text-text-muted">
            هل أنت متأكد من حذف{' '}
            <span className="font-semibold text-text">«{productName}»</span>؟
            <br />لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1 justify-center"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'جاري الحذف…' : 'حذف'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
