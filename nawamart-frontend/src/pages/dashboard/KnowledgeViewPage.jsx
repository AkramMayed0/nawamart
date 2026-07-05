import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, ThumbsUp, ThumbsDown, BookOpen, ChevronRight } from 'lucide-react'
import { getArticles, getArticleBySlug, getCategories, rateArticle } from '@/api/knowledge'
import usePageTitle from '@/hooks/usePageTitle'

export default function KnowledgeViewPage() {
  usePageTitle('قاعدة المعرفة')
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSlug, setSelectedSlug] = useState(null)

  const { data: categories } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: () => getCategories().then(r => r.data.data),
    staleTime: 120_000,
  })

  const { data: articles } = useQuery({
    queryKey: ['kb-articles', search, selectedCat],
    queryFn: () => getArticles({ query: search || undefined, category: selectedCat || undefined }).then(r => r.data.data),
    staleTime: 30_000,
  })

  const { data: article } = useQuery({
    queryKey: ['kb-article', selectedSlug],
    queryFn: () => getArticleBySlug(selectedSlug).then(r => r.data.data),
    enabled: !!selectedSlug,
  })

  const rateMutation = useMutation({
    mutationFn: (helpful) => rateArticle(article._id, helpful),
    onSuccess: () => toast.success('شكراً على تقييمك'),
  })

  if (selectedSlug && article) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <button onClick={() => setSelectedSlug(null)}
          className="flex items-center gap-1 font-cairo text-sm text-text-muted hover:text-text mb-4">
          <ChevronRight size={16} />
          العودة إلى المقالات
        </button>
        <h1 className="font-cairo text-2xl font-extrabold text-text mb-2">{article.title}</h1>
        <div className="flex items-center gap-3 mb-4 text-xs text-text-subtle">
          <span>{categories?.find(c => c.id === article.category)?.label || article.category}</span>
          <span>{article.viewCount} مشاهدة</span>
        </div>
        <div className="prose prose-sm max-w-none rounded-2xl bg-white border border-border p-6 mb-6">
          <p className="font-cairo text-text leading-relaxed whitespace-pre-wrap">{article.content}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-border p-4">
          <span className="font-cairo text-sm text-text-muted">هل كان هذا المقال مفيداً؟</span>
          <button onClick={() => rateMutation.mutate(true)}
            className="flex items-center gap-1 rounded-xl bg-green-50 px-3 py-1.5 font-cairo text-xs font-bold text-green-600 hover:bg-green-100">
            <ThumbsUp size={14} /> نعم
          </button>
          <button onClick={() => rateMutation.mutate(false)}
            className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 font-cairo text-xs font-bold text-red-500 hover:bg-red-100">
            <ThumbsDown size={14} /> لا
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="text-center mb-8">
        <BookOpen size={40} className="mx-auto text-accent mb-3" />
        <h1 className="font-cairo text-2xl font-extrabold text-text">مركز المساعدة</h1>
        <p className="font-cairo text-sm text-text-muted mt-1">ابحث في قاعدة المعرفة لتحصل على المساعدة</p>
      </div>

      <div className="relative mx-auto mb-8 max-w-xl">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في مقالات المساعدة..."
          className="w-full rounded-2xl border border-border bg-white py-3 pr-12 pl-4 font-cairo text-sm outline-none focus:border-accent shadow-sm" />
      </div>

      {!search && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button onClick={() => setSelectedCat('')}
            className={`rounded-xl px-4 py-2 font-cairo text-xs font-bold transition-all ${!selectedCat ? 'bg-accent text-white' : 'bg-white border border-border text-text-muted hover:border-accent'}`}>
            الكل
          </button>
          {(categories ?? []).map((c) => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)}
              className={`rounded-xl px-4 py-2 font-cairo text-xs font-bold transition-all ${selectedCat === c.id ? 'bg-accent text-white' : 'bg-white border border-border text-text-muted hover:border-accent'}`}>
              {c.label} ({c.count})
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(!articles || articles.length === 0) ? (
          <div className="col-span-full text-center py-16">
            <p className="font-cairo text-text-muted">لا توجد مقالات مطابقة</p>
          </div>
        ) : articles.map((a) => (
          <div key={a._id} onClick={() => setSelectedSlug(a.slug)}
            className="cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-md hover:border-accent/30">
            <h3 className="font-cairo text-base font-bold text-text mb-1">{a.title}</h3>
            {a.excerpt && <p className="font-cairo text-sm text-text-muted line-clamp-2">{a.excerpt}</p>}
            <div className="flex items-center gap-3 mt-3">
              <span className="font-cairo text-[10px] text-text-subtle bg-bg-soft rounded-full px-2 py-0.5">
                {categories?.find(c => c.id === a.category)?.label || a.category}
              </span>
              <span className="font-cairo text-[10px] text-text-subtle">{a.viewCount} مشاهدة</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
