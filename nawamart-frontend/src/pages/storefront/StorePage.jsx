import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Package, Search, ShoppingBag, Store, Timer, TrendingUp, Truck } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { getProductsByStore } from '@/api/products'
import { usePreferencesStore } from '@/store/preferencesStore'
import usePageTitle from '@/hooks/usePageTitle'
import StoreHero from '@/components/storefront/StoreHero'
import ProductCard from '@/components/storefront/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function CategoryChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-pill border px-5 font-cairo text-sm font-extrabold transition-all duration-300 ${
        active
          ? 'border-transparent bg-primary text-white shadow-md shadow-primary/20 scale-105'
          : 'border-border/50 bg-bg-soft/50 text-text-muted hover:border-primary/30 hover:bg-white hover:text-primary hover:shadow-sm'
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

  const { showFeaturedProducts } = usePreferencesStore()
  const featuredProducts = filteredProducts.filter(p => p.isFeatured).slice(0, 4)
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
      <StoreHero store={store} productCount={products.length} isDigital={isDigital} />

      {/* ── Feature grid ── */}
      <section className="bg-bg-soft/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <h2 className="font-cairo text-3xl font-extrabold text-primary text-center mb-4">
            لماذا {store.name}؟
          </h2>
          <p className="font-cairo text-base text-text-muted text-center mb-12 max-w-lg mx-auto leading-relaxed">
            نقدم لك تجربة تسوق مريحة وآمنة من البداية إلى النهاية، لأن راحتك هي أولويتنا.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group rounded-2xl border border-border/50 bg-white p-6 shadow-sm hover-lift hover:border-primary/10 hover:shadow-glass-hover text-center md:text-right">
              <div className="mx-auto md:mx-0 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1">
                <CreditCard size={26} />
              </div>
              <h3 className="font-cairo text-lg font-extrabold text-primary">دفع موثوق</h3>
              <p className="mt-2 font-cairo text-sm leading-relaxed text-text-muted">
                ادفع بأمان وتابع حالة طلبك بسهولة من لوحة تحكمك الخاصة.
              </p>
            </div>
            
            <div className="group rounded-2xl border border-border/50 bg-white p-6 shadow-sm hover-lift hover:border-primary/10 hover:shadow-glass-hover text-center md:text-right">
              <div className="mx-auto md:mx-0 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1">
                <Truck size={26} />
              </div>
              <h3 className="font-cairo text-lg font-extrabold text-primary">توصيل للمنازل</h3>
              <p className="mt-2 font-cairo text-sm leading-relaxed text-text-muted">
                استلم طلباتك بسرعة إلى باب المنزل مع فريق توصيل محترف.
              </p>
            </div>

            <div className="group rounded-2xl border border-border/50 bg-white p-6 shadow-sm hover-lift hover:border-primary/10 hover:shadow-glass-hover text-center md:text-right">
              <div className="mx-auto md:mx-0 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1">
                <ShoppingBag size={26} />
              </div>
              <h3 className="font-cairo text-lg font-extrabold text-primary">سلة ذكية</h3>
              <p className="mt-2 font-cairo text-sm leading-relaxed text-text-muted">
                احفظ مشترياتك وأكمل الطلب في أي وقت من أي جهاز.
              </p>
            </div>

            <div className="group rounded-2xl border border-border/50 bg-white p-6 shadow-sm hover-lift hover:border-primary/10 hover:shadow-glass-hover text-center md:text-right">
              <div className="mx-auto md:mx-0 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:-translate-y-1">
                <TrendingUp size={26} />
              </div>
              <h3 className="font-cairo text-lg font-extrabold text-primary">تجربة سريعة</h3>
              <p className="mt-2 font-cairo text-sm leading-relaxed text-text-muted">
                تصفح المنتجات وأكمل الطلب بخطوات بسيطة وواجهة عصرية.
              </p>
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

        {showFeaturedProducts && featuredProducts.length > 0 && (
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
