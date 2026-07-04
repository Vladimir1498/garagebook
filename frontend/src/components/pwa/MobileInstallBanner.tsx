import { useState, useEffect } from 'react'
import { usePwaInstall } from '../../hooks/usePwaInstall'
import Button from '../ui/Button'
import { X, Download, Smartphone, Share } from 'lucide-react'

export default function MobileInstallBanner() {
  const { canInstall, platform, hasNativePrompt, promptInstall, dismiss, isInstalled } = usePwaInstall()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [manualMode, setManualMode] = useState(false)

  useEffect(() => {
    if (isInstalled) return
    const key = 'pwa_dismissed'
    if (localStorage.getItem(key)) return
    const timer = setTimeout(() => setShow(true), 4000)
    return () => clearTimeout(timer)
  }, [isInstalled])

  if (!show || dismissed || isInstalled) return null

  const handleInstall = async () => {
    setInstalling(true)
    const ok = await promptInstall()
    setInstalling(false)
    if (ok) { setShow(false); return }
    // Native prompt failed - show manual instructions
    setManualMode(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    dismiss()
  }

  const isIOS = platform === 'ios'
  const isAndroid = platform === 'android'

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-slide-up md:hidden">
      <div className="rounded-2xl border border-primary-200 bg-white p-4 shadow-lg dark:border-primary-800 dark:bg-surface-800">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary-50 p-2.5 text-primary-500">
            {isIOS ? <Share className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {manualMode ? 'Как установить' : 'Установить GarageBook'}
            </p>
            {manualMode && isAndroid && (
              <div className="mt-1 space-y-1 text-xs text-surface-600">
                <p>1. Нажмите <b>⋮</b> (три точки) вверху справа</p>
                <p>2. Выберите <b>«Установить приложение»</b></p>
                <p>3. Подтвердите установку</p>
              </div>
            )}
            {manualMode && isIOS && (
              <div className="mt-1 space-y-1 text-xs text-surface-600">
                <p>1. Нажмите кнопку <b>Поделиться</b> внизу</p>
                <p>2. Выберите <b>«На экран Домой»</b></p>
                <p>3. Нажмите «Добавить»</p>
              </div>
            )}
            {!manualMode && isIOS && (
              <p className="mt-0.5 text-xs text-surface-500">Safari → Поделиться → На экран Домой</p>
            )}
            {!manualMode && isAndroid && (
              <p className="mt-0.5 text-xs text-surface-500">Chrome → ⋮ → Установить приложение</p>
            )}
          </div>
          <button onClick={handleDismiss} className="rounded-lg p-1 text-surface-400 hover:text-surface-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {!manualMode && (
            <Button size="sm" onClick={handleInstall} loading={installing} className="flex-1">
              <Download className="h-4 w-4" /> Установить
            </Button>
          )}
          <Button size="sm" variant={manualMode ? 'secondary' : 'ghost'} onClick={handleDismiss} className={manualMode ? 'flex-1' : ''}>
            {manualMode ? 'Понятно' : 'Позже'}
          </Button>
        </div>
      </div>
    </div>
  )
}
