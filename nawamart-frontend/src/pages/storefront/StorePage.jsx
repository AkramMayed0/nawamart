import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Clock, Package, Search, ShieldCheck, ShoppingBag, Sparkles, Store, Truck } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { getProductsByStore } from '@/api/products'
import usePageTitle from '@/hooks/usePageTitle'
import ProductCard from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import NotFound from '@/components/ui/NotFound'

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function CategoryChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full border px-4 font-cairo text-sm font-bold transition-colors ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-white text-text-muted hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </button>
  )
}

export default function StorePage() {
  const { slug } = useParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
  } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then((response) => response.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
  usePageTitle(store?.name)

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['products', store?._id],
    queryFn: () => getProductsByStore(store._id).then((response) => response.data.data ?? []),
    enabled: !!store?._id,
    staleTime: 1000 * 60 * 2,
  })

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])

  const filteredProducts = useMemo(() => {
    const term = normalize(query)

    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category
      const matchesQuery = !term || normalize(`${product.name} ${product.description} ${product.category}`).includes(term)
      return matchesCategory && matchesQuery
    })
  }, [products, query, category])

  const featuredProducts = filteredProducts.slice(0, 4)
  const isDigital = store?.type === 'digital'

  if (storeError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-5">
            <Store size={36} className="text-danger" />
          </div>
          <h2 className="font-cairo font-extrabold text-2xl text-text mb-2">المتجر غير متاح حالياً</h2>
          <p className="font-cairo text-sm text-text-muted leading-relaxed mb-6">
            هذا المتجر غير متاح للعرض حاليًا. قد يكون ميقاتًا مؤقتًا أو تم إغلاقه من قبل الإدارة.
            <br />
            يرجى المحاولة لاحقًا أو التواصل مع صاحب المتجر.
          </p>
        </div>
      </div>
    )
  }

  if (storeLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8" dir="rtl">
        <div className="mb-6 h-72 animate-pulse rounded-xl bg-white" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1.5fr_.8fr]">
          <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-white md:p-8">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 font-cairo text-xs font-bold text-white">
                <Sparkles size={14} />
                {isDigital ? 'متجر رقمي بتسليم سريع' : 'تسوق منتجات مختارة بعناية'}
              </span>
              <h1 className="mt-5 font-cairo text-3xl font-extrabold leading-tight md:text-4xl">
                {store.name}
              </h1>
              <p className="mt-3 max-w-xl font-cairo text-sm leading-7 text-white/78 md:text-base">
                {store.description || 'اكتشف منتجات المتجر، أضف ما يعجبك إلى السلة، وأكمل طلبك بخطوات واضحة وسريعة.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-accent-700"
                >
                  تسوق الآن
                  <ArrowLeft size={16} />
                </a>
                <span className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/10 px-4 font-cairo text-sm font-bold text-white">
                  <CheckCircle2 size={16} />
                  {products.length.toLocaleString('en-US')} منتج متاح
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <Truck className="text-primary" size={24} />
              <p className="mt-4 font-cairo text-sm font-extrabold text-text">{isDigital ? 'تسليم رقمي' : 'توصيل للمنزل'}</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">طريقة تسليم مناسبة لنوع المتجر.</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <ShieldCheck className="text-success-dark" size={24} />
              <p className="mt-4 font-cairo text-sm font-extrabold text-text">دفع موثق</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">ارفع الوصل وتابع حالة طلبك.</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <Clock className="text-accent-700" size={24} />
              <p className="mt-4 font-cairo text-sm font-extrabold text-text">تجربة سريعة</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">تصفح، أضف، وأكمل الطلب بسهولة.</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <ShoppingBag className="text-primary" size={24} />
              <p className="mt-4 font-cairo text-sm font-extrabold text-text">سلة ذكية</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">كل مشترياتك محفوظة حتى الدفع.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-y border-border bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4">
          <CategoryChip active={category === 'all'} onClick={() => setCategory('all')}>
            الكل
          </CategoryChip>
          {categories.map((item) => (
            <CategoryChip key={item} active={category === item} onClick={() => setCategory(item)}>
              {item}
            </CategoryChip>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-cairo text-sm font-bold text-primary">منتجات المتجر</p>
            <h2 className="mt-1 font-cairo text-2xl font-extrabold text-text">اختيارات جاهزة للشراء</h2>
            <p className="mt-1 font-cairo text-sm text-text-muted">
              {productsLoading ? 'جاري تحميل المنتجات...' : `${filteredProducts.length.toLocaleString('en-US')} منتج حسب التصفية الحالية`}
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن منتج..."
              className="h-11 w-full rounded-lg border border-border bg-white pr-10 pl-4 font-cairo text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <div className="mb-8 rounded-xl border border-border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-cairo text-base font-extrabold text-text">منتجات مميزة</h3>
              <span className="font-cairo text-xs font-bold text-accent-700">أفضل الاختيارات</span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} featured />
              ))}
            </div>
          </div>
        )}

        {productsLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!productsLoading && filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
            <Package size={34} className="mx-auto text-text-subtle" />
            <h3 className="mt-3 font-cairo text-base font-extrabold text-text">لا توجد منتجات مطابقة</h3>
            <p className="mt-1 font-cairo text-sm text-text-muted">جرب تغيير البحث أو اختيار قسم آخر.</p>
          </div>
        )}

        {!productsLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
