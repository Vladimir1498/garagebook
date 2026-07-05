import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Globe, Download, Trash2, Bell, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeContext } from '../../contexts/ThemeContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import PushToggle from '../../components/pwa/PushToggle'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  useAuth()
  const { theme, setTheme } = useContext(ThemeContext)
  const [showDelete, setShowDelete] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [maintenanceNotifs, setMaintenanceNotifs] = useState(true)
  const [insuranceNotifs, setInsuranceNotifs] = useState(true)

  const downloadBlob = (data: Blob, filename: string) => {
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleExportJson = async () => {
    setExporting(true)
    try {
      const response = await api.get('/api/v1/export', { responseType: 'blob' })
      downloadBlob(response.data, 'garagebook_export.json')
      toast.success('JSON экспорт готов')
    } catch {
      toast.error('Ошибка экспорта')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const response = await api.get('/api/v1/export/pdf', { responseType: 'blob' })
      downloadBlob(response.data, 'garagebook_report.pdf')
      toast.success('PDF-отчёт готов')
    } catch {
      toast.error('Ошибка генерации отчёта')
    } finally {
      setExportingPdf(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Светлая' },
    { value: 'dark', label: 'Тёмная' },
    { value: 'system', label: 'Системная' },
  ]

  const langOptions = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
  ]

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <PageWrapper title={t('settings.title')}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">Внешний вид</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-surface-500" /> : theme === 'light' ? <Sun className="h-5 w-5 text-surface-500" /> : <Monitor className="h-5 w-5 text-surface-500" />}
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.theme')}</span>
              </div>
              <Select options={themeOptions} value={theme} onChange={(e) => setTheme(e.target.value as any)} className="w-36" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-surface-500" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language')}</span>
              </div>
              <Select options={langOptions} value={i18n.language} onChange={(e) => handleLangChange(e.target.value)} className="w-36" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">{t('settings.notifications')}</h3>
          <div className="space-y-3">
            <PushToggle />
            {[
              { label: 'Email-уведомления', checked: emailNotifs, onChange: setEmailNotifs },
              { label: 'Напоминания о ТО', checked: maintenanceNotifs, onChange: setMaintenanceNotifs },
              { label: 'Напоминания о страховке', checked: insuranceNotifs, onChange: setInsuranceNotifs },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-surface-400" />
                  <span className="text-sm text-surface-700 dark:text-surface-300">{item.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => item.onChange(!item.checked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.checked ? 'bg-primary-500' : 'bg-surface-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-800">
          <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">Данные</h3>
          <div className="space-y-3">
            <Button variant="secondary" onClick={handleExportPdf} loading={exportingPdf} className="w-full justify-start">
              <FileText className="h-4 w-4" />
              <div className="text-left">
                <p className="text-sm font-medium">Отчёт PDF</p>
                <p className="text-xs text-surface-400">Красивый отчёт для покупателя авто</p>
              </div>
            </Button>
            <Button variant="secondary" onClick={handleExportJson} loading={exporting} className="w-full justify-start">
              <Download className="h-4 w-4" />
              <div className="text-left">
                <p className="text-sm font-medium">Экспорт JSON</p>
                <p className="text-xs text-surface-400">Все данные в структурированном формате</p>
              </div>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
          <h3 className="mb-2 text-base font-semibold text-red-700 dark:text-red-400">{t('settings.delete_account')}</h3>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">Это действие необратимо. Все данные будут удалены.</p>
          <Button variant="danger" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" />Удалить аккаунт</Button>
        </div>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Удалить аккаунт?" size="sm">
        <p className="text-sm text-surface-600">Введите ваш email для подтверждения.</p>
        <input
          type="email"
          className="mt-3 w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm dark:border-surface-600 dark:bg-surface-800 dark:text-white"
          placeholder="you@example.com"
          id="delete-email-confirm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowDelete(false)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={async () => {
            const input = document.getElementById('delete-email-confirm') as HTMLInputElement
            if (input?.value) {
              try {
                await api.post('/api/v1/users/delete', { email: input.value })
                toast.success('Аккаунт удалён')
                window.location.href = '/login'
              } catch { toast.error('Ошибка удаления') }
            } else { toast.error('Введите email') }
          }}>{t('common.confirm')}</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
