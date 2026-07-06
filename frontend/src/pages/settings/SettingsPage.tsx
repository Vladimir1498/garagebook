import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, Monitor, Globe, Download, Trash2, Bell, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeContext } from '../../contexts/ThemeContext'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import PushToggle from '../../components/pwa/PushToggle'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  useAuth()
  const { theme, setTheme } = useContext(ThemeContext)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
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
    } catch { toast.error('Ошибка экспорта') }
    finally { setExporting(false) }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const response = await api.get('/api/v1/export/pdf', { responseType: 'blob' })
      downloadBlob(response.data, 'garagebook_report.pdf')
      toast.success('PDF-отчёт готов')
    } catch { toast.error('Ошибка генерации отчёта') }
    finally { setExportingPdf(false) }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white sm:text-2xl">{t('settings.title')}</h1>
        <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">Настройте приложение под себя</p>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Внешний вид</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-surface-400" /> : theme === 'light' ? <Sun className="h-4 w-4 text-surface-400" /> : <Monitor className="h-4 w-4 text-surface-400" />}
              <span className="text-sm font-medium text-surface-800 dark:text-surface-200">{t('settings.theme')}</span>
            </div>
            <Select
              options={[{ value: 'light', label: 'Светлая' }, { value: 'dark', label: 'Тёмная' }, { value: 'system', label: 'Системная' }]}
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-36"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-surface-400" />
              <span className="text-sm font-medium text-surface-800 dark:text-surface-200">{t('settings.language')}</span>
            </div>
            <Select
              options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]}
              value={i18n.language}
              onChange={(e) => { i18n.changeLanguage(e.target.value); localStorage.setItem('language', e.target.value) }}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Уведомления</h3>
        <div className="mt-4 space-y-4">
          <PushToggle />
          <Toggle label="Email-уведомления" description="Получать уведомления на email" checked={emailNotifs} onChange={setEmailNotifs} />
          <Toggle label="Напоминания о ТО" description="Напоминать о техническом обслуживании" checked={maintenanceNotifs} onChange={setMaintenanceNotifs} />
          <Toggle label="Напоминания о страховке" description="Напоминать о сроке действия страховки" checked={insuranceNotifs} onChange={setInsuranceNotifs} />
        </div>
      </div>

      {/* Data */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Данные</h3>
        <div className="mt-4 space-y-2">
          <button onClick={handleExportPdf} disabled={exportingPdf} className="card-interactive flex w-full items-center gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
              {exportingPdf ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <FileText className="h-4 w-4" strokeWidth={1.75} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Отчёт PDF</p>
              <p className="text-xs text-surface-400">Красивый отчёт для покупателя</p>
            </div>
          </button>
          <button onClick={handleExportJson} disabled={exporting} className="card-interactive flex w-full items-center gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
              {exporting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Download className="h-4 w-4" strokeWidth={1.75} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Экспорт JSON</p>
              <p className="text-xs text-surface-400">Все данные в формате JSON</p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/30 dark:bg-red-950/10">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Опасная зона</h3>
        <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/70">Удаление аккаунта необратимо. Все данные будут удалены.</p>
        <Button variant="danger" size="sm" className="mt-3" onClick={() => setShowDelete(true)} iconLeft={<Trash2 />}>Удалить аккаунт</Button>
      </div>

      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Удалить аккаунт?" size="sm">
        <p className="text-sm text-surface-500">Введите ваш email для подтверждения.</p>
        <input
          type="email"
          value={deleteEmail}
          onChange={(e) => setDeleteEmail(e.target.value)}
          className="input-field mt-3"
          placeholder="you@example.com"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setShowDelete(false); setDeleteEmail('') }}>Отмена</Button>
          <Button variant="danger" loading={false} onClick={async () => {
            if (!deleteEmail) { toast.error('Введите email'); return }
            try {
              await api.post('/api/v1/users/delete', { email: deleteEmail })
              toast.success('Аккаунт удалён')
              window.location.href = '/login'
            } catch { toast.error('Ошибка удаления') }
          }}>Удалить</Button>
        </div>
      </Modal>
    </div>
  )
}
