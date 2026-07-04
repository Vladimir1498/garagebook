import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { setSent(true) } catch { toast.error('Ошибка') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4 dark:bg-surface-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-xl font-bold text-white">G</div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-white">{t('auth.forgot_password')}</h1>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-6 text-center shadow-card dark:border-surface-700 dark:bg-surface-800">
            <p className="text-sm text-surface-600">{t('auth.reset_sent')}</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-medium text-primary-500 hover:text-primary-600">{t('auth.sign_in')}</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-800">
            <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            <Button type="submit" className="w-full" loading={loading}>Отправить</Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-500">
          <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">{t('auth.sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}
