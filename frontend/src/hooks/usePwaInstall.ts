import { useState, useEffect, useCallback, useRef } from 'react'

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
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setPlatform(getPlatform())

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      const p = e as BeforeInstallPromptEvent
      promptRef.current = p
      setDeferredPrompt(p)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Retry registration if event hasn't fired
    const interval = setInterval(() => {
      if (promptRef.current) return
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          if (reg.installing) reg.installing.addEventListener('statechange', () => {})
        }).catch(() => {})
      }
    }, 2000)

    const installed = () => setIsInstalled(true)
    window.addEventListener('appinstalled', installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
      clearInterval(interval)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    const p = promptRef.current || deferredPrompt
    if (!p) return false
    try {
      await p.prompt()
      const { outcome } = await p.userChoice
      promptRef.current = null
      setDeferredPrompt(null)
      if (outcome === 'accepted') { setIsInstalled(true); return true }
    } catch {}
    return false
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    localStorage.setItem('pwa_dismissed', new Date().toDateString())
  }, [])

  const wasDismissed = localStorage.getItem('pwa_dismissed') === new Date().toDateString()

  return {
    canInstall: !isInstalled && !wasDismissed,
    isInstalled,
    platform,
    hasNativePrompt: !!(promptRef.current || deferredPrompt),
    promptInstall,
    dismiss,
  }
}
