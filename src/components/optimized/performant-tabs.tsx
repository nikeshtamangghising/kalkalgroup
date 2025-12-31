'use client'

import { memo, useCallback, useMemo, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: string
  content: React.ReactNode
  disabled?: boolean
}

interface PerformantTabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  tabClassName?: string
  contentClassName?: string
  lazy?: boolean // Only render active tab content
}

const PerformantTabs = memo(({
  tabs,
  defaultTab,
  onChange,
  className = '',
  tabClassName = '',
  contentClassName = '',
  lazy = true
}: PerformantTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set([activeTab]))
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleTabChange = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || tab.disabled) return

    setActiveTab(tabId)
    setRenderedTabs(prev => new Set([...prev, tabId]))
    onChange?.(tabId)
  }, [tabs, onChange])

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId)
    let nextIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        break
      case 'ArrowRight':
        event.preventDefault()
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        nextIndex = 0
        break
      case 'End':
        event.preventDefault()
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    const nextTab = tabs[nextIndex]
    if (nextTab && !nextTab.disabled) {
      handleTabChange(nextTab.id)
      tabRefs.current.get(nextTab.id)?.focus()
    }
  }, [tabs, handleTabChange])

  // Memoized tab buttons
  const tabButtons = useMemo(() => {
    return tabs.map((tab) => (
      <button
        key={tab.id}
        ref={(el) => {
          if (el) {
            tabRefs.current.set(tab.id, el)
          } else {
            tabRefs.current.delete(tab.id)
          }
        }}
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`panel-${tab.id}`}
        tabIndex={activeTab === tab.id ? 0 : -1}
        disabled={tab.disabled}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          activeTab === tab.id
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          tab.disabled && 'opacity-50 cursor-not-allowed',
          tabClassName
        )}
        onClick={() => handleTabChange(tab.id)}
        onKeyDown={(e) => handleKeyDown(e, tab.id)}
      >
        {tab.icon && (
          <span className="mr-2" aria-hidden="true">
            {tab.icon}
          </span>
        )}
        {tab.label}
      </button>
    ))
  }, [tabs, activeTab, tabClassName, handleTabChange, handleKeyDown])

  // Memoized content panels
  const contentPanels = useMemo(() => {
    return tabs.map((tab) => {
      const isActive = activeTab === tab.id
      const shouldRender = !lazy || renderedTabs.has(tab.id)

      return (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          className={cn(
            'focus:outline-none',
            isActive ? 'block' : 'hidden',
            contentClassName
          )}
          tabIndex={0}
        >
          {shouldRender ? tab.content : null}
        </div>
      )
    })
  }, [tabs, activeTab, lazy, renderedTabs, contentClassName])

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4"
      >
        {tabButtons}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {contentPanels}
      </div>
    </div>
  )
})

PerformantTabs.displayName = 'PerformantTabs'

export default PerformantTabs