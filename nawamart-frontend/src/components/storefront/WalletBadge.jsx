const WALLET_META = {
  cherry: {
    label: 'Cherry',
    mark: 'CH',
    tone: 'bg-danger text-white',
    ring: 'ring-danger/20',
  },
  kuraimi: {
    label: 'الكريمي',
    mark: 'KR',
    tone: 'bg-primary text-white',
    ring: 'ring-primary/20',
  },
  oneCash: {
    label: 'OneCash',
    mark: '1C',
    tone: 'bg-accent text-white',
    ring: 'ring-accent/20',
  },
}

export default function WalletBadge({ wallet, active = false, compact = false }) {
  const meta = WALLET_META[wallet] || {
    label: wallet,
    mark: wallet?.slice(0, 2).toUpperCase() || '?',
    tone: 'bg-bg-soft text-text',
    ring: 'ring-border/40',
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg ${active ? 'ring-2' : ''} ${active ? meta.ring : ''}`}>
      <div className={`flex ${compact ? 'h-9 w-9' : 'h-10 w-10'} items-center justify-center rounded-lg ${meta.tone} font-inter text-xs font-extrabold shadow-sm`}>
        {meta.mark}
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate font-cairo text-sm font-extrabold text-text">{meta.label}</p>
        </div>
      )}
    </div>
  )
}
