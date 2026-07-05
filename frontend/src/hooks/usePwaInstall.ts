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

async function debugPWA(): Promise<string[]> {
  const issues: string[] = []
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    issues.push('Нужен HTTPS для PWA')
  }
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null)
    if (!reg) issues.push('Service Worker не зарегистрирован')
  } else {
    issues.push('Service Worker не поддерживается')
  }
  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
  if (!manifestLink) {
    issues.push('Манифест не найден')
  } else {
    try {
      const resp = await fetch(manifestLink.href)
      const manifest = await resp.json()
      if (!manifest.display || manifest.display !== 'standalone') {
        issues.push('display должен быть standalone')
      }
      if (!manifest.start_url) {
        issues.push('start_url отсутствует')
      }
    } catch (e) {
      issues.push('Манифест не загружается: ' + e)
    }
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    issues.push('Приложение уже установлено')
  }
  return issues
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [issues, setIssues] = useState<string[]>([])
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setPlatform(getPlatform())

    debugPWA().then(setIssues)

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

    const interval = setInterval(() => {
      if (promptRef.current) return
      debugPWA().then(setIssues)
    }, 5000)

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
    issues,
  }
}

export { debugPWA }
