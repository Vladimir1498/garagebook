import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const mobile = /android|iphone|ipad|ipod|mobile|windows phone/i.test(ua)
    setIsMobile(mobile)

    if (isIOSSafari()) setPlatform('ios')
    else if (isAndroid()) setPlatform('android')
    else setPlatform('desktop')

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
    }

    // Android/Chrome: wait for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS: can't auto-prompt, but show manual instructions after delay
    if (isIOSSafari() && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setCanInstall(true), 8000)
      window.addEventListener('appinstalled', () => { setIsInstalled(true); setCanInstall(false) })
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    const installed = () => { setIsInstalled(true); setCanInstall(false) }
    window.addEventListener('appinstalled', installed)

    return () => {
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
    localStorage.setItem('pwa_install_dismissed', 'true')
    setCanInstall(false)
  }

  const wasDismissed = localStorage.getItem('pwa_install_dismissed') === 'true'

  return {
    canInstall: canInstall && !isInstalled && !wasDismissed,
    isInstalled,
    isMobile,
    platform,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
  }
}
