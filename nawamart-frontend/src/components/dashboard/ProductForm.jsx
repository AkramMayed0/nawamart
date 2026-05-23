import { useState, useRef, useEffect } from 'react'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'

const MAX_IMAGES = 4

function ImageUploadGrid({ images, previews, onAdd, onRemove }) {
  const inputRef = useRef(null)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text font-cairo">
        صور المنتج
        <span className="font-normal text-text-subtle mr-1">(حتى {MAX_IMAGES} صور)</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white"
            >
              <Icon name="x" size={10} strokeWidth={3} />
            </button>
          </div>
        ))}
        {previews.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary-50 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Icon name="plus" size={20} className="text-text-subtle" />
            <span className="font-cairo text-xs text-text-subtle">إضافة</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={onAdd}
      />
    </div>
  )
}

export default function ProductFormModal({ open, onClose, onSubmit, initialData, loading }) {
  const isEdit = !!initialData

  const [name,        setName]        = useState('')
  const [description, setDesc]        = useState('')
  const [price,       setPrice]       = useState('')
  const [stock,       setStock]       = useState('')
  const [imageFiles,  setImageFiles]  = useState([])
  const [previews,    setPreviews]    = useState([])
  const [errors,      setErrors]      = useState({})

  // Pre-fill when editing
  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || '')
      setDesc(initialData.description || '')
      setPrice(initialData.price?.toString() || '')
      setStock(initialData.stock?.toString() || '')
      setPreviews(initialData.images || [])
      setImageFiles([])
    }
    if (open && !initialData) {
      setName(''); setDesc(''); setPrice(''); setStock('')
      setImageFiles([]); setPreviews([])
    }
    setErrors({})
  }, [open, initialData])

  function handleImageAdd(e) {
    const files = Array.from(e.target.files)
    const remaining = MAX_IMAGES - previews.length
    const toAdd = files.slice(0, remaining)
    setImageFiles(prev => [...prev, ...toAdd])
    setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function handleImageRemove(i) {
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
    // Only remove from imageFiles if it's a new file (not an existing URL)
    const preview = previews[i]
    if (preview?.startsWith('blob:')) {
      const blobIdx = previews.filter((p, idx) => idx < i && p.startsWith('blob:')).length
      setImageFiles(prev => prev.filter((_, idx) => idx !== blobIdx))
    }
  }

  function validate() {
    const e = {}
    if (!name.trim())         e.name  = 'اسم المنتج مطلوب'
    if (!price || isNaN(Number(price)) || Number(price) < 0)
                              e.price = 'أدخل سعراً صحيحاً'
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0)
                              e.stock = 'أدخل كمية صحيحة'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const formData = new FormData()
    formData.append('name',        name.trim())
    formData.append('description', description.trim())
    formData.append('price',       Number(price))
    formData.append('stock',       Number(stock))
    // Existing image URLs (for edit)
    const existingUrls = previews.filter(p => !p.startsWith('blob:'))
    existingUrls.forEach(url => formData.append('existingImages[]', url))
    // New files
    imageFiles.forEach(f => formData.append('images', f))

    onSubmit(formData)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="اسم المنتج"
          placeholder="مثال: عسل سدر يمني"
          value={name}
          onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})) }}
          error={errors.name}
          disabled={loading}
        />

        <Textarea
          label="وصف المنتج"
          placeholder="وصف مختصر يظهر للعملاء…"
          value={description}
          onChange={e => setDesc(e.target.value)}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="السعر (ر.ي)"
            type="number"
            min="0"
            placeholder="0"
            inputClassName="font-en"
            value={price}
            onChange={e => { setPrice(e.target.value); setErrors(p => ({...p, price: ''})) }}
            error={errors.price}
            disabled={loading}
          />
          <Input
            label="الكمية المتاحة"
            type="number"
            min="0"
            placeholder="0"
            inputClassName="font-en"
            value={stock}
            onChange={e => { setStock(e.target.value); setErrors(p => ({...p, stock: ''})) }}
            error={errors.stock}
            disabled={loading}
          />
        </div>

        <ImageUploadGrid
          images={imageFiles}
          previews={previews}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={loading}>
            {loading ? 'جاري الحفظ…' : isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
