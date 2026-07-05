import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Shield, ShieldOff, Copy, Check, AlertCircle } from 'lucide-react'
import {
  getMfaStatus,
  generateMfaSecret,
  verifyAndEnableMfa,
  disableMfa,
  regenerateBackupCodes,
} from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import usePageTitle from '@/hooks/usePageTitle'

export default function MfaSetupPage() {
  const updateUser = useAuthStore((s) => s.updateUser)

  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [step, setStep] = useState('idle') // idle | generate | verify | disable
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disableError, setDisableError] = useState('')
  const [codesCopied, setCodesCopied] = useState(false)

  usePageTitle('إعدادات MFA')

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      setLoading(true)
      const res = await getMfaStatus()
      setMfaEnabled(res.data.data.mfaEnabled)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function handleSetup() {
    setActionLoading(true)
    try {
      const res = await generateMfaSecret()
      setSecret(res.data.data.secret)
      setQrCode(res.data.data.qrCode)
      setBackupCodes(res.data.data.backupCodes)
      setStep('generate')
    } catch (err) {
      toast.error(err?.message || 'فشل إنشاء سر MFA')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleVerify() {
    if (!verifyCode.trim() || verifyCode.length < 6) {
      setVerifyError('يرجى إدخال رمز تحقق صحيح (6 أرقام)')
      return
    }
    setActionLoading(true)
    setVerifyError('')
    try {
      await verifyAndEnableMfa(verifyCode.trim())
      setMfaEnabled(true)
      setStep('idle')
      updateUser({ mfaEnabled: true })
      toast.success('تم تفعيل المصادقة الثنائية بنجاح!')
    } catch (err) {
      setVerifyError(err?.message || 'رمز التحقق غير صحيح')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDisable() {
    if (!disableCode.trim()) {
      setDisableError('يرجى إدخال رمز التحقق')
      return
    }
    setActionLoading(true)
    setDisableError('')
    try {
      await disableMfa(disableCode.trim())
      setMfaEnabled(false)
      setStep('idle')
      updateUser({ mfaEnabled: false })
      toast.success('تم تعطيل المصادقة الثنائية')
    } catch (err) {
      setDisableError(err?.message || 'فشل تعطيل MFA')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRegenerateCodes() {
    setActionLoading(true)
    try {
      const res = await regenerateBackupCodes()
      setBackupCodes(res.data.data.backupCodes)
      setCodesCopied(false)
      toast.success('تم إنشاء رموز احتياطية جديدة')
    } catch (err) {
      toast.error(err?.message || 'فشل إنشاء الرموز الاحتياطية')
    } finally {
      setActionLoading(false)
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCodesCopied(true)
    setTimeout(() => setCodesCopied(false), 3000)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="font-cairo font-bold text-2xl text-text mb-1">المصادقة الثنائية (MFA)</h1>
        <p className="font-cairo text-sm text-text-muted">أضف طبقة أمان إضافية لحماية حسابك</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {mfaEnabled ? <Shield size={24} /> : <ShieldOff size={24} />}
            </div>
            <div>
              <h3 className="font-cairo font-bold text-text">
                {mfaEnabled ? 'المصادقة الثنائية مفعلة' : 'المصادقة الثنائية غير مفعلة'}
              </h3>
              <p className="font-cairo text-sm text-text-muted">
                {mfaEnabled
                  ? 'حسابك محمي بطبقة أمان إضافية'
                  : 'قم بتفعيل MFA لحماية حسابك من الوصول غير المصرح به'}
              </p>
            </div>
          </div>
          {mfaEnabled ? (
            <Button variant="outline" size="sm" onClick={() => { setStep('disable'); setDisableCode(''); setDisableError('') }}>
              تعطيل MFA
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleSetup} loading={actionLoading}>
              تفعيل MFA
            </Button>
          )}
        </div>
      </div>

      {/* Setup Step: Show QR Code */}
      {step === 'generate' && !mfaEnabled && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center">
            <h3 className="font-cairo font-bold text-lg text-text mb-4">امسح رمز QR</h3>
            {qrCode && (
              <img src={qrCode} alt="MFA QR Code" className="mx-auto w-48 h-48 mb-4" />
            )}
            <p className="font-cairo text-sm text-text-muted mb-2">
              استخدم تطبيق Google Authenticator أو Authy لمسح الرمز
            </p>
            <p className="font-cairo text-xs text-text-subtle">
              أو أدخل المفتاح يدوياً:
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <code className="bg-bg-soft px-3 py-1.5 rounded-lg text-sm font-en" dir="ltr">
                {secret}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(secret); toast.success('تم النسخ') }}
                className="p-1.5 rounded-lg hover:bg-bg-soft text-text-muted"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Verify Code */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-cairo font-bold text-lg text-text mb-4">تأكيد التفعيل</h3>
            <p className="font-cairo text-sm text-text-muted mb-4">
              أدخل رمز التحقق المكون من 6 أرقام من تطبيق المصادقة
            </p>
            <div className="flex items-end gap-3 max-w-xs">
              <Input
                label="رمز التحقق"
                placeholder="000000"
                inputClassName="font-en text-center"
                value={verifyCode}
                onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerifyError('') }}
                error={verifyError}
                disabled={actionLoading}
              />
              <Button
                variant="primary"
                onClick={handleVerify}
                loading={actionLoading}
                disabled={actionLoading || verifyCode.length < 6}
              >
                تأكيد
              </Button>
            </div>
          </div>

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-amber-500" />
                <h3 className="font-cairo font-bold text-lg text-text">رموز الاسترداد الاحتياطية</h3>
              </div>
              <p className="font-cairo text-sm text-text-muted mb-4">
                احفظ هذه الرموز في مكان آمن. يمكنك استخدامها لمرة واحدة فقط إذا فقدت الوصول إلى تطبيق المصادقة.
              </p>
              <div className="bg-bg-soft rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="font-en text-sm text-text font-mono bg-white rounded-lg px-3 py-2 text-center border border-border" dir="ltr">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                  {codesCopied ? <Check size={16} /> : <Copy size={16} />}
                  {codesCopied ? 'تم النسخ' : 'نسخ الرموز'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disable Step */}
      {step === 'disable' && mfaEnabled && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
          <h3 className="font-cairo font-bold text-lg text-red-600 mb-2">تعطيل المصادقة الثنائية</h3>
          <p className="font-cairo text-sm text-text-muted mb-4">
            أدخل رمز التحقق من تطبيق المصادقة لتأكيد تعطيل MFA
          </p>
          <div className="flex items-end gap-3 max-w-xs">
            <Input
              label="رمز التحقق"
              placeholder="000000"
              inputClassName="font-en text-center"
              value={disableCode}
              onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setDisableError('') }}
              error={disableError}
              disabled={actionLoading}
            />
            <Button
              variant="danger"
              onClick={handleDisable}
              loading={actionLoading}
              disabled={actionLoading || disableCode.length < 6}
            >
              تعطيل
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setStep('idle')}>
            إلغاء
          </Button>
        </div>
      )}

      {/* Backup Codes Management (when enabled) */}
      {mfaEnabled && step === 'idle' && (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <h3 className="font-cairo font-bold text-lg text-text mb-2">رموز الاسترداد</h3>
          <p className="font-cairo text-sm text-text-muted mb-4">
            يمكنك إنشاء رموز استرداد جديدة إذا نفدت الرموز الحالية
          </p>
          <Button variant="outline" size="sm" onClick={handleRegenerateCodes} loading={actionLoading}>
            إنشاء رموز جديدة
          </Button>
          {backupCodes.length > 0 && (
            <div className="mt-4">
              <div className="bg-bg-soft rounded-xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, idx) => (
                    <code key={idx} className="font-en text-sm text-text font-mono bg-white rounded-lg px-3 py-2 text-center border border-border" dir="ltr">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={copyBackupCodes}>
                {codesCopied ? <Check size={16} /> : <Copy size={16} />}
                {codesCopied ? 'تم النسخ' : 'نسخ الرموز'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
