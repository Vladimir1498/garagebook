import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ email, password, full_name: fullName })
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ошибка регистрации')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 p-4 dark:bg-surface-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-xl font-bold text-white">G</div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-white">{t('auth.create_account')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-700 dark:bg-surface-800">
          <Input label={t('auth.full_name')} value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Иван Иванов" />
          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Минимум 8 символов" />
          <Button type="submit" className="w-full" loading={loading}>{t('auth.create_account')}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          {t('auth.has_account')}{' '}
          <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">{t('auth.sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}
