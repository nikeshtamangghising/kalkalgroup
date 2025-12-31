'use client'

import { memo, useCallback, useMemo, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PerformantTabs from '@/components/optimized/performant-tabs'
import OptimizedRecommendationGrid from './optimized-recommendation-grid'

type TabType = 'trending' | 'personalized' | 'popular'

interface Tab {
  id: TabType
  label: string
  icon: string
  endpoint: string
}

const OptimizedTabbedRecommendations = memo(() => {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('trending')

  // Memoized tabs configuration
  const tabs = useMemo((): Tab[] => {
    const baseTabs: Tab[] = [
      {
        id: 'trending',
        label: 'Trending Now',
        icon: '🔥',
        endpoint: 'trending'
      },
      {
        id: 'popular',
        label: 'Popular Choices',
        icon: '⭐',
        endpoint: 'popular-new'
      }
    ]

    // Add personalized tab for logged-in users
    if (session?.user) {
      baseTabs.splice(1, 0, {
        id: 'personalized',
        label: 'For You',
        icon: '✨',
        endpoint: 'personalized'
      })
    }

    return baseTabs
  }, [session?.user])

  // Set default active tab based on user session
  useEffect(() => {
    if (session?.user) {
      setActiveTab('personalized')
    } else {
      setActiveTab('trending')
    }
  }, [session?.user])

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as TabType)
  }, [])

  // Memoized tab content
  const tabContent = useMemo(() => {
    const userId = session?.user?.id || 'guest'
    
    return tabs.map((tab) => ({
      id: tab.id,
      label: tab.label,
      icon: tab.icon,
      content: (
        <OptimizedRecommendationGrid
          key={tab.id}
          apiEndpoint={`/api/recommendations/${userId}/${tab.endpoint}`}
          compact={true}
        />
      )
    }))
  }, [tabs, session?.user?.id])

  if (tabs.length === 0) {
    return null
  }

  return (
    <section className="py-3 bg-white">
      <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4">
        <PerformantTabs
          tabs={tabContent}
          defaultTab={activeTab}
          onChange={handleTabChange}
          lazy={true}
          className="w-full"
          tabClassName="flex-1 text-center"
        />
      </div>
    </section>
  )
})

OptimizedTabbedRecommendations.displayName = 'OptimizedTabbedRecommendations'

export default OptimizedTabbedRecommendations