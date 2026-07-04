import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ошибка входа')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4 dark:bg-surface-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-xl font-bold text-white">G</div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-white">{t('auth.login')}</h1>
          <p className="mt-1 text-sm text-surface-500">Войдите в свой аккаунт GarageBook</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-800">
          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-surface-600">
              <input type="checkbox" className="h-4 w-4 rounded border-surface-300" />
              Запомнить меня
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">{t('auth.forgot_password')}</Link>
          </div>

          <Button type="submit" className="w-full" loading={loading}>{t('auth.sign_in')}</Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-surface-400 dark:bg-surface-800">{t('auth.or')}</span></div>
          </div>

          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t('auth.login_google')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-medium text-primary-500 hover:text-primary-600">{t('auth.create_account')}</Link>
        </p>
      </div>
    </div>
  )
}
