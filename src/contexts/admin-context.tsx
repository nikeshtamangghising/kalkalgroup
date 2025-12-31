'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  image?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  children?: Category[]
  childCategories?: Category[]
}

interface AdminContextType {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  refreshCategories: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories?type=flat&includeInactive=true')
      if (response.ok) {
        const result = await response.json()
        console.log('Admin Context - API Response:', result) // Debug log
        let categoriesData = []
        if (Array.isArray(result)) {
          categoriesData = result
        } else if (result.data && result.data.categories && Array.isArray(result.data.categories)) {
          categoriesData = result.data.categories
        } else if (result.categories && Array.isArray(result.categories)) {
          categoriesData = result.categories
        }
        
        console.log('Admin Context - Parsed categories:', categoriesData) // Debug log
        setCategories(categoriesData)
      } else {
        console.error('Admin Context - API Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Admin Context - Error details:', errorText)
      }
    } catch (error) {
      console.error('Admin Context - Failed to refresh categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories on initial load only
  useEffect(() => {
    refreshCategories()
  }, [])

  return (
    <AdminContext.Provider value={{
      categories,
      setCategories,
      refreshCategories,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
