import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Star, Lock } from 'lucide-react'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import Modal from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'

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
  const store = useAuthStore(s => s.store)
  const isBusiness = store?.plan === 'business'

  const [name,          setName]          = useState('')
  const [description,   setDesc]          = useState('')
  const [price,         setPrice]         = useState('')
  const [salePrice,     setSalePrice]     = useState('')
  const [stock,         setStock]         = useState('')
  const [unlimitedStock, setUnlimitedStock] = useState(false)
  const [category,      setCategory]      = useState('')
  const [weight,        setWeight]        = useState('')
  const [sku,           setSku]           = useState('')
  const [brand,         setBrand]         = useState('')
  const [barcode,       setBarcode]       = useState('')
  const [isFeatured,    setIsFeatured]    = useState(false)
  const [isActive,      setIsActive]      = useState(true)
  const [imageFiles,    setImageFiles]    = useState([])
  const [previews,      setPreviews]      = useState([])
  const [errors,        setErrors]        = useState({})

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || '')
      setDesc(initialData.description || '')
      setPrice(initialData.price?.toString() || '')
      setSalePrice(initialData.salePrice?.toString() || '')
      setStock(initialData.stock?.toString() || '')
      setUnlimitedStock(initialData.unlimitedStock || false)
      setCategory(initialData.category || '')
      setWeight(initialData.weight?.toString() || '')
      setSku(initialData.sku || '')
      setBrand(initialData.brand || '')
      setBarcode(initialData.barcode || '')
      setIsFeatured(initialData.isFeatured || false)
      setIsActive(initialData.isActive !== false)
      setPreviews(initialData.images || [])
      setImageFiles([])
    }
    if (open && !initialData) {
      setName(''); setDesc(''); setPrice(''); setSalePrice('')
      setStock(''); setUnlimitedStock(false); setCategory(''); setWeight('')
      setSku(''); setBrand(''); setBarcode(''); setIsFeatured(false); setIsActive(true)
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
    const preview = previews[i]
    if (preview?.startsWith('blob:')) {
      const blobIdx = previews.filter((p, idx) => idx < i && p.startsWith('blob:')).length
      setImageFiles(prev => prev.filter((_, idx) => idx !== blobIdx))
    }
  }

  function validate() {
    const e = {}
    if (!name.trim())                 e.name  = 'اسم المنتج مطلوب'
    if (!price || isNaN(Number(price)) || Number(price) < 0)
                                      e.price = 'أدخل سعراً صحيحاً'
    if (salePrice && (isNaN(Number(salePrice)) || Number(salePrice) < 0))
                                      e.salePrice = 'سعر الخصم غير صحيح'
    if (salePrice && Number(salePrice) >= Number(price))
                                      e.salePrice = 'سعر الخصم يجب أن يكون أقل من السعر الأصلي'
    if (!unlimitedStock && (stock === '' || isNaN(Number(stock)) || Number(stock) < 0))
                                      e.stock = 'أدخل كمية صحيحة'
    if (weight && (isNaN(Number(weight)) || Number(weight) < 0))
                                      e.weight = 'أدخل وزناً صحيحاً بالغرام'
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
    if (salePrice) formData.append('salePrice', Number(salePrice))
    formData.append('stock',       unlimitedStock ? 999999 : Number(stock))
    formData.append('unlimitedStock', unlimitedStock)
    if (category.trim()) formData.append('category', category.trim())
    if (weight) formData.append('weight', Number(weight))
    if (sku.trim()) formData.append('sku', sku.trim())
    if (brand.trim()) formData.append('brand', brand.trim())
    if (barcode.trim()) formData.append('barcode', barcode.trim())
    formData.append('isFeatured', isFeatured)
    if (!isEdit) formData.append('isActive', isActive)

    const existingUrls = previews.filter(p => !p.startsWith('blob:'))
    existingUrls.forEach(url => formData.append('existingImages[]', url))
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

        <Input
          label="التصنيف"
          placeholder="مثال: عسل، ملابس، إلكترونيات"
          value={category}
          onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})) }}
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
            label="سعر الخصم (ر.ي)"
            type="number"
            min="0"
            placeholder="اختياري"
            inputClassName="font-en"
            value={salePrice}
            onChange={e => { setSalePrice(e.target.value); setErrors(p => ({...p, salePrice: ''})) }}
            error={errors.salePrice}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input
              label={isBusiness ? 'SKU (رمز المنتج)' : 'SKU (رمز المنتج)'}
              placeholder={isBusiness ? 'مثال: HSL-001' : 'متوفر في باقة Business'}
              inputClassName="font-en"
              value={isBusiness ? sku : ''}
              onChange={e => setSku(e.target.value)}
              disabled={loading || !isBusiness}
            />
            {!isBusiness && (
              <div className="absolute inset-0 rounded-lg bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <a href="/subscribe?plan=business" className="inline-flex items-center gap-1 font-cairo font-bold text-[11px] text-accent-700 bg-accent-50 border border-accent-200 rounded-lg px-2.5 py-1 pointer-events-auto hover:bg-accent-100 transition-colors">
                  <Lock size={11} />
                  Business فقط
                </a>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              label={isBusiness ? 'العلامة التجارية' : 'العلامة التجارية'}
              placeholder={isBusiness ? 'مثال: نسمة, سامسونج' : 'متوفر في باقة Business'}
              value={isBusiness ? brand : ''}
              onChange={e => setBrand(e.target.value)}
              disabled={loading || !isBusiness}
            />
            {!isBusiness && (
              <div className="absolute inset-0 rounded-lg bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <a href="/subscribe?plan=business" className="inline-flex items-center gap-1 font-cairo font-bold text-[11px] text-accent-700 bg-accent-50 border border-accent-200 rounded-lg px-2.5 py-1 pointer-events-auto hover:bg-accent-100 transition-colors">
                  <Lock size={11} />
                  Business فقط
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Input
              label={unlimitedStock ? 'المخزون' : 'الكمية المتاحة'}
              type="number"
              min="0"
              placeholder={unlimitedStock ? 'غير محدود' : '0'}
              inputClassName="font-en"
              value={unlimitedStock ? '' : stock}
              onChange={e => { setStock(e.target.value); setErrors(p => ({...p, stock: ''})) }}
              error={errors.stock}
              disabled={loading || unlimitedStock}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={unlimitedStock}
                onChange={e => setUnlimitedStock(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-border text-primary focus:ring-accent/30"
              />
              <span className="font-cairo text-xs text-text-muted">مخزون غير محدود</span>
            </label>
          </div>
          <Input
            label="الوزن (غرام)"
            type="number"
            min="0"
            placeholder="اختياري — للمنتجات المادية"
            inputClassName="font-en"
            value={weight}
            onChange={e => { setWeight(e.target.value); setErrors(p => ({...p, weight: ''})) }}
            error={errors.weight}
            disabled={loading}
          />
        </div>

        <div className="relative">
          <Input
            label={isBusiness ? 'الباركود' : 'الباركود'}
            placeholder={isBusiness ? 'مثال: 6223001234567' : 'متوفر في باقة Business'}
            inputClassName="font-en"
            value={isBusiness ? barcode : ''}
            onChange={e => setBarcode(e.target.value)}
            disabled={loading || !isBusiness}
          />
          {!isBusiness && (
            <div className="absolute inset-0 rounded-lg bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <a href="/subscribe?plan=business" className="inline-flex items-center gap-1 font-cairo font-bold text-[11px] text-accent-700 bg-accent-50 border border-accent-200 rounded-lg px-2.5 py-1 pointer-events-auto hover:bg-accent-100 transition-colors">
                <Lock size={11} />
                Business فقط
              </a>
            </div>
          )}
        </div>

        <ImageUploadGrid
          images={imageFiles}
          previews={previews}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <Star size={14} className={isFeatured ? 'text-accent' : 'text-text-subtle'} />
            <span className="font-cairo text-sm text-text">منتج مميز</span>
          </label>

          {!isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-border text-primary focus:ring-accent/30"
              />
              {isActive ? <Eye size={14} className="text-success" /> : <EyeOff size={14} className="text-text-subtle" />}
              <span className="font-cairo text-sm text-text">متاح للعرض</span>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border sticky bottom-0 bg-white">
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