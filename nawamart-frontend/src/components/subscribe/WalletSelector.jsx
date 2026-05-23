/**
 * WalletSelector
 * Shows Cherry / Kuraimi / OneCash cards.
 * After selecting, shows account-info box with number + instructions.
 *
 * Props:
 *   wallet     string  — selected wallet id
 *   setWallet  fn
 *   amount     number  — subscription price in YER
 */
import { CreditCard } from 'lucide-react'
import clsx from 'clsx'
import { WALLETS } from '@/api/subscriptions'

// Static NawaMart payment accounts (replace with real data from API)
const ACCOUNTS = {
  cherry:  { number: '771 423 890', name: 'نوا مارت' },
  kuraimi: { number: '771 423 890', name: 'نوا مارت' },
  onecash: { number: '771 423 890', name: 'نوا مارت' },
}

export default function WalletSelector({ wallet, setWallet, amount }) {
  const account = ACCOUNTS[wallet]

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <h3 className="font-cairo font-bold text-lg text-text mb-1">طريقة الدفع</h3>
      <p className="font-cairo text-sm text-text-muted mb-5">
        حوّل مبلغ الاشتراك{' '}
        <strong className="text-primary font-inter dk-num">
          {amount.toLocaleString('en-US')} ر.ي
        </strong>{' '}
        إلى إحدى المحافظ، ثم ارفع صورة الوصل.
      </p>

      {/* Wallet cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {WALLETS.map(w => {
          const active = wallet === w.id
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWallet(w.id)}
              className={clsx(
                'flex flex-col gap-2 p-3.5 rounded-xl border text-right transition-all',
                active
                  ? 'bg-primary-50 border-primary shadow-[0_0_0_3px_rgba(27,63,114,0.12)]'
                  : 'bg-white border-border hover:border-primary/40'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                active ? 'bg-primary text-white' : 'bg-bg-soft text-text-muted'
              )}>
                <CreditCard size={16} />
              </div>
              <span className={clsx(
                'font-cairo font-bold text-sm leading-tight',
                active ? 'text-primary' : 'text-text'
              )}>
                {w.label}
              </span>
              <span className="font-cairo text-[11px] text-text-muted leading-tight">
                {w.sub}
              </span>
            </button>
          )
        })}
      </div>

      {/* Account info box */}
      {account && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3.5 flex flex-col gap-2 text-sm font-cairo">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">المحفظة</span>
            <span className="font-semibold text-text">
              {WALLETS.find(w => w.id === wallet)?.label}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">رقم الحساب</span>
            <span className="font-inter font-bold text-primary dk-num tracking-wide">
              {account.number}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">باسم</span>
            <span className="font-semibold text-text">{account.name}</span>
          </div>
          <div className="flex justify-between items-center border-t border-primary-100 pt-2 mt-1">
            <span className="text-text-muted">المبلغ</span>
            <span className="font-inter font-extrabold text-primary dk-num">
              {amount.toLocaleString('en-US')} ر.ي
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
