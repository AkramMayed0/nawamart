const WALLET_META = {
  kuraimi: {
    label: 'الكريمي',
    img: '/wallets/kuraimi.png',
    bg: 'bg-white',
  },
  oneCash: {
    label: 'OneCash',
    img: '/wallets/onecash.png',
    bg: 'bg-white',
  },
  jaib: {
    label: 'جيب',
    img: '/wallets/jaib.png',
    bg: 'bg-white',
  },
}

export default function WalletBadge({ wallet, active = false, compact = false }) {
  const meta = WALLET_META[wallet] || {
    label: wallet,
    img: null,
    bg: 'bg-bg-soft',
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg ${active ? 'ring-2 ring-primary/20' : ''}`}>
      <div className={`flex ${compact ? 'h-9 w-9' : 'h-10 w-10'} items-center justify-center rounded-lg ${meta.bg} shadow-sm overflow-hidden`}>
        {meta.img ? (
          <img src={meta.img} alt={meta.label} className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[10px] font-extrabold font-inter text-text-muted">{meta.label?.slice(0, 2)}</span>
        )}
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate font-cairo text-sm font-extrabold text-text">{meta.label}</p>
        </div>
      )}
    </div>
  )
}
