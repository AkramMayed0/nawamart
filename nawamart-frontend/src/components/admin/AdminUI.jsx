export function SectionHeader({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      <h2 className="font-cairo font-extrabold text-xl text-slate-800">{title}</h2>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  )
}

export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`font-cairo text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            value === o.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="font-cairo text-sm px-3.5 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-500 transition-colors w-56"
    />
  )
}

export function Table({ isLoading, isEmpty, emptyMsg, cols, headers, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className={`grid ${cols} gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold font-cairo text-slate-500`}>
        {headers.map(h => <span key={h}>{h}</span>)}
      </div>
      {isLoading ? (
        <div className="flex flex-col divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`grid ${cols} gap-4 px-5 py-4 animate-pulse`}>
              {headers.map((_, j) => <div key={j} className="h-4 bg-slate-100 rounded" />)}
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">📭</span>
          <p className="font-cairo text-slate-400">{emptyMsg}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {children}
        </div>
      )}
    </div>
  )
}

export function ActionBtn({ color, onClick, loading, children }) {
  const colors = {
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    red:   'bg-red-100   text-red-700   hover:bg-red-200',
    blue:  'bg-blue-100  text-blue-700  hover:bg-blue-200',
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`font-cairo font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${colors[color] ?? colors.green}`}
    >
      {loading ? '…' : children}
    </button>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-cairo font-bold text-base text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors text-lg">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Badge({ map, status }) {
  const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold font-cairo px-2.5 py-1 rounded-full ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {s.label}
    </span>
  )
}

export function ActiveBadge({ isActive }) {
  return isActive
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold font-cairo px-2.5 py-1 rounded-full bg-green-100 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-current" />نشط</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold font-cairo px-2.5 py-1 rounded-full bg-red-100 text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-current" />موقوف</span>
}
