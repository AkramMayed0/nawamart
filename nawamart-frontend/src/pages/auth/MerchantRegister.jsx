import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function MerchantRegister() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-white border border-border rounded-xl p-8 w-full max-w-md">
        <img src="/logo.png" alt="NawaMart" className="h-8 mb-6" />
        <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">إنشاء حساب تاجر</h1>
        <p className="font-cairo text-sm text-text-muted mb-6">أنشئ حسابك وابدأ البيع اليوم</p>
        <div className="flex flex-col gap-4">
          <Input label="الاسم الكامل" placeholder="محمد أحمد" />
          <Input label="البريد الإلكتروني" type="email" placeholder="you@example.com" />
          <Input label="كلمة المرور" type="password" placeholder="••••••••" />
          <Button
            variant="accent" size="lg" className="w-full justify-center mt-2"
            onClick={() => navigate('/onboarding')}
          >
            ابدأ مجاناً
          </Button>
        </div>
        <p className="font-cairo text-sm text-center text-text-muted mt-4">
          لديك حساب؟{' '}
          <button onClick={() => navigate('/merchant/login')} className="text-primary font-semibold hover:underline">
            سجّل دخولك
          </button>
        </p>
      </div>
    </div>
  )
}
