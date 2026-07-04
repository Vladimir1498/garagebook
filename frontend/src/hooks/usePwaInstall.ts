import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function getPlatform(): 'ios' | 'android' | 'desktop' {
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'desktop'
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    setPlatform(getPlatform())

    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    // Dismissed today?
    const dismissedDate = localStorage.getItem('pwa_install_dismissed_date')
    if (dismissedDate === new Date().toDateString()) return

    // Listen for beforeinstallprompt (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const installed = () => setIsInstalled(true)
    window.addEventListener('appinstalled', installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') {
        setIsInstalled(true)
        return true
      }
    } catch {}
    return false
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem('pwa_install_dismissed_date', new Date().toDateString())
  }, [])

  return {
    canInstall: !isInstalled,
    isInstalled,
    platform,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
  }
}
