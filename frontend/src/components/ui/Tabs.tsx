import { clsx } from 'clsx'
import { useRef, useEffect } from 'react'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const el = tabRefs.current.get(activeTab)
    const container = containerRef.current
    if (el && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = el.getBoundingClientRect()
      const scrollLeft = container.scrollLeft
      const targetScroll = tabRect.left - containerRect.left + scrollLeft - containerRect.width / 2 + tabRect.width / 2
      container.scrollTo({ left: targetScroll, behavior: 'smooth' })
    }
  }, [activeTab])

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto scrollbar-none border-b border-surface-100 dark:border-surface-700/50"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'relative shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150',
            'sm:px-4 sm:text-sm',
            activeTab === tab.id
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
          )}
        >
          {tab.icon && <span className="h-3.5 w-3.5 sm:h-4 sm:w-4">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-0.5 rounded-full bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-700 dark:text-surface-400">
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary-500" />
          )}
        </button>
      ))}
    </div>
  )
}
