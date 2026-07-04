import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    // Detect mobile
    const ua = navigator.userAgent.toLowerCase()
    const mobile = /android|iphone|ipad|ipod|mobile|windows phone/i.test(ua)
    setIsMobile(mobile)

    // Detect platform
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform('ios')
    else if (/android/i.test(ua)) setPlatform('android')
    else setPlatform('desktop')

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed today
    const dismissedDate = localStorage.getItem('pwa_install_dismissed_date')
    if (dismissedDate) {
      const today = new Date().toDateString()
      if (dismissedDate === today) {
        return // Don't show again today
      }
    }

    // Android/Chrome: wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show install prompt after delay for mobile
    const timer = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone').matches) {
        setCanInstall(true)
      }
    }, 5000)

    const installed = () => { setIsInstalled(true); setCanInstall(false) }
    window.addEventListener('appinstalled', installed)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setCanInstall(false)
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem('pwa_install_dismissed_date', new Date().toDateString())
    setCanInstall(false)
  }

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    isMobile,
    platform,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
  }
}
