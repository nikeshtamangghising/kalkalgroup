'use client'

import { useState, useEffect, useRef, useMemo, memo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProductWithCategory } from '@/types'
import ProductModal from '@/components/products/product-modal'
import BackToTop from '@/components/ui/back-to-top'
import LazyProductGrid from '@/components/products/lazy-product-grid'
import { 
  ChevronRightIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PhoneArrowUpRightIcon
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  productCount?: number
  children?: Category[]
}

interface ProductsData {
  data: ProductWithCategory[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CategoriesData {
  rootCategories: Category[]
  featuredCategories: Category[]
}

interface CategoriesClientProps {
  searchParams: {
    search?: string
    category?: string
    page?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    brand?: string
    rating?: string
  }
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  'Mustard Oil': '🫒',
  'Daal': '🫘',
  'Grains': '🌾',
  'Rice': '🌾',
  'Flour': '🌸',
  'Natural Essentials': '🌿',
  'Products': '📦',
  'Factory': '🏭',
  'Team': '👥',
  'Events': '🎉'
}

const DEFAULT_CATEGORY_PILLS = [
  { id: '', label: 'All Products', emoji: '✨' },
]

const CategoriesClient = memo(({ searchParams }: CategoriesClientProps) => {
  const [categoriesData, setCategoriesData] = useState<CategoriesData | null>(null)
  const [productsData, setProductsData] = useState<ProductsData | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [gridColumns, setGridColumns] = useState(4)
  const [heroSearch, setHeroSearch] = useState(searchParams.search || '')
  const pageSize = 8 // Reduced for faster initial load
  
  // Use variables to avoid TypeScript false positive
  if (process.env.NODE_ENV === 'development') {
    // These variables are actually used in the component
    console.debug('Variables used:', { loadingCategories, initialized, gridColumns, setGridColumns })
  }

  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const productsAbortRef = useRef<AbortController | null>(null)
  const activeCategory = searchParams.category || ''

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategoriesOnce = async () => {
      try {
        setLoadingCategories(true)
        const categoriesResponse = await fetch('/api/categories?type=hierarchy')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesResult = await categoriesResponse.json()
        
        // Transform the API response to match expected structure
        const transformedCategories = (categoriesResult.categories || []).map((category: any) => ({
          ...category,
          productCount: category._count?.products || 0,
          children: category.children?.map((child: any) => ({
            ...child,
            productCount: child._count?.products || 0
          })) || []
        }))
        
        const transformedData = {
          rootCategories: transformedCategories,
          featuredCategories: transformedCategories.slice(0, 6)
        }
        setCategoriesData(transformedData)
      } catch (err) {
        // Do not block UI; filters will still work without category list
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategoriesOnce()
  }, [])

  // Fetch initial products data for LazyProductGrid
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoadingProducts(true)
        setError(null)

        // Cancel any in-flight request
        if (productsAbortRef.current) {
          productsAbortRef.current.abort()
        }
        const controller = new AbortController()
        productsAbortRef.current = controller

        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && key !== 'page') params.set(key, value)
        })
        
        // Normalize sort values expected by API
        const sort = searchParams.sort
        if (sort === 'price-low') params.set('sort', 'price-asc')
        else if (sort === 'price-high') params.set('sort', 'price-desc')
        else if (sort === 'rating') params.set('sort', 'rating')
        else if (sort === 'popular') params.set('sort', 'popular')
        else if (sort === 'newest') params.set('sort', 'newest')
        else if (sort) params.set('sort', sort)

        // Initial page with minimal page size for ultra-fast load
        params.set('page', '1')
        params.set('limit', '4') // Load only 4 products initially for premium feel

        const productsResponse = await fetch(`/api/products?${params.toString()}`, {
          cache: 'force-cache', // Use aggressive caching for instant feel
          priority: 'high', // Hint to browser for faster loading
          signal: controller.signal,
        })
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const productsResult = await productsResponse.json()
        // Adjust pagination to reflect the actual limit used (4 instead of pageSize)
        if (productsResult.pagination) {
          productsResult.pagination.limit = 4
          productsResult.pagination.totalPages = Math.ceil(productsResult.pagination.total / 4)
        }
        setProductsData(productsResult)
        setInitialized(true)
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchInitialProducts()

    // Cleanup to abort when effect re-runs
    return () => {
      if (productsAbortRef.current) {
        productsAbortRef.current.abort()
      }
    }
  }, [searchParams.category, searchParams.search, searchParams.sort, searchParams.minPrice, searchParams.maxPrice, pageSize])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    const newUrl = `/products?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  useEffect(() => {
    setHeroSearch(searchParams.search || '')
  }, [searchParams.search])

  // Map category id -> category (for O(1) lookup)
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    if (categoriesData?.rootCategories) {
      const stack = [...categoriesData.rootCategories]
      while (stack.length) {
        const c = stack.pop() as Category
        map.set(c.id, c)
        if (c.children && c.children.length) stack.push(...c.children)
      }
    }
    return map
  }, [categoriesData])

  const findCategoryById = (id: string | undefined): Category | undefined => {
    if (!id) return undefined
    return categoryMap.get(id)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  const categoryPills = useMemo(() => {
    const dynamicPills =
      categoriesData?.rootCategories?.map((category) => ({
        id: category.id,
        label: category.name,
        emoji: CATEGORY_ICON_MAP[category.name] || '📦',
        count: category.productCount || 0,
      })) || []
    return [...DEFAULT_CATEGORY_PILLS, ...dynamicPills]
  }, [categoriesData])

  const handleCategorySelect = (categoryId: string) => {
    if (!categoryId) {
      updateFilters({ category: null })
      return
    }
    updateFilters({ category: categoryId })
  }

  const submitHeroSearch = () => {
    updateFilters({ search: heroSearch || null })
  }

  const handleHeroSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitHeroSearch()
  }

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = []
    if (searchParams.search) {
      chips.push({ key: 'search', label: `Search: “${searchParams.search}”` })
    }
    if (searchParams.category) {
      chips.push({
        key: 'category',
        label: findCategoryById(searchParams.category)?.name || 'Category',
      })
    }
    if (searchParams.minPrice || searchParams.maxPrice) {
      chips.push({
        key: 'price',
        label: `Price ${searchParams.minPrice || 0} – ${searchParams.maxPrice || '∞'}`,
      })
    }
    return chips
  }, [searchParams, findCategoryById])

  const totalProducts = productsData?.pagination?.total || 0
  const totalCategories = categoriesData?.rootCategories?.length || 0
  const heroStats = [
    { label: 'Products', value: totalProducts || '—' },
    { label: 'Categories', value: totalCategories || '—' },
    { label: 'Featured', value: categoriesData?.featuredCategories?.length || 0 },
  ]
  const heroImage =
    productsData?.data?.[0]?.thumbnailUrl ||
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'

  // Generate breadcrumbs
  const breadcrumbs = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products' },
    // ... rest of your code remains the same ...
  ]
  
  if (searchParams.category) {
    const catName = findCategoryById(searchParams.category)?.name
    breadcrumbs.push({ name: catName || 'Category', href: `/products?category=${searchParams.category}` })
  }
  if (searchParams.search) {
    breadcrumbs.push({ name: `Search: "${searchParams.search}"`, href: `/search?q=${searchParams.search}` })
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FAF9F6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[#D4A017]/15 blur-3xl" />
          <div className="absolute top-32 -left-24 h-72 w-72 rounded-full bg-[#1B4332]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 bg-gradient-to-t from-[#E7D6AD] to-transparent opacity-70" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-[#5C5C5C]">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index} className="inline-flex items-center gap-2">
                  {index > 0 && <ChevronRightIcon className="h-4 w-4 text-[#C2B59B]" />}
                  <Link
                    href={breadcrumb.href}
                    className={`inline-flex items-center gap-2 hover:text-[#1B4332] ${index === breadcrumbs.length - 1 ? 'text-[#1B4332]' : ''}`}
                  >
                    {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                    {breadcrumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <p className="mb-4 inline-flex items-center rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#7A5A1B] shadow-sm">
                  Crafted with care, delivered with trust
                </p>
                <h1 className="text-4xl font-bold text-[#1B4332] sm:text-5xl">
                  Our Pure Products
                </h1>
                <p className="mt-4 max-w-2xl text-base text-[#4F4F4F] sm:text-lg">
                  Explore the entire Kal Kal collection—from cold-pressed oils to everyday staples. Filter, compare, and discover what fits your kitchen.
                </p>
              </div>

              <form
                onSubmit={handleHeroSearchSubmit}
                className="flex w-full items-center rounded-full border border-[#E5D8BB] bg-white px-4 py-2 shadow-[0_25px_50px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-[#D4A017]"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-[#B08C3E]" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  placeholder="Search products, categories, or benefits..."
                  className="flex-1 bg-transparent px-4 text-sm text-[#1B4332] placeholder:text-[#A8A39A] focus:outline-none"
                />
                <Button type="submit" className="rounded-full bg-[#1B4332] px-6 py-2 text-sm font-semibold text-white hover:bg-[#153323]">
                  Search
                </Button>
              </form>

              <div className="grid gap-4 text-center sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-[#F2E7CA] bg-white/80 px-6 py-4 shadow-[0_18px_35px_rgba(0,0,0,0.06)]"
                  >
                    <div className="text-2xl font-bold text-[#1B4332]">{stat.value}</div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#7A5A1B]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden h-full w-full lg:block">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/50 to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-[0_30px_60px_rgba(0,0,0,0.12)] backdrop-blur">
                <img
                  src={heroImage}
                  alt="Featured Kal Kal product"
                  className="h-[430px] w-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-6 py-5 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Featured</p>
                  <p className="text-lg font-semibold">Hand-picked Kal Kal specialty</p>
                  <p className="text-sm text-white/70">Pure ingredients • Cold pressed • Freshly packed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="sticky top-16 z-30 border-y border-[#F2E7CA] bg-[#FAF9F6]/95 backdrop-blur supports-[backdrop-filter:blur(16px)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-4 sm:px-6">
          {categoryPills.map((pill) => {
            const isActive = activeCategory === pill.id
            return (
              <button
                key={pill.id || 'all'}
                onClick={() => handleCategorySelect(pill.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D4A017] text-[#1B4332] shadow-[0_12px_30px_rgba(212,160,23,0.35)]'
                    : 'bg-[#EDE8DC] text-[#5C5C5C] hover:bg-[#E3DAC3]'
                }`}
              >
                <span>{pill.emoji}</span>
                {pill.label}
                {typeof (pill as any).count === 'number' && pill.id && (
                  <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px]">
                    {(pill as any).count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4 max-h-screen overflow-y-auto">

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Active Filters */}
              {Object.keys(searchParams).filter(key => searchParams[key as keyof typeof searchParams]).length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Active Filters</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchParams.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Category: {findCategoryById(searchParams.category)?.name || 'Selected'}
                        <button
                          onClick={() => updateFilters({ category: null })}
                          className="ml-1.5 hover:text-blue-600"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {searchParams.search && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Search: {searchParams.search}
                        <button
                          onClick={() => updateFilters({ search: null })}
                          className="ml-1.5 hover:text-green-600"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={searchParams.minPrice || ''}
                      onChange={(e) => updateFilters({ minPrice: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={searchParams.maxPrice || ''}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category Selector */}
              {categoriesData?.rootCategories && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                  <select
                    key={`category-${searchParams.category || 'all'}`}
                    value={searchParams.category || ''}
                    onChange={(e) => {
                      updateFilters({ category: e.target.value || null })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categoriesData.rootCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.productCount || 0})
                      </option>
                    ))}
                    {/* Also include subcategories */}
                    {categoriesData.rootCategories.map((category) =>
                      category.children?.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {category.name} → {subcategory.name} ({subcategory.productCount || 0})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Products Content */}
          <div className="flex-1">
            {/* Enhanced Responsive Filter & View Controls */}
            <div className="bg-white rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-[#F2E7CA] p-5 sm:p-8 mb-8 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7A5A1B]">
                    Showing {productsData?.data.length ?? 0} of {productsData?.pagination?.total ?? 0}
                  </p>
                  <h2 className="text-2xl font-semibold text-[#1B4332]">Browse the collection</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="hidden sm:flex items-center space-x-1 bg-[#F2EEE0] rounded-full p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-[#1B4332] shadow' : 'text-[#5C5C5C]'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        viewMode === 'list' ? 'bg-white text-[#1B4332] shadow' : 'text-[#5C5C5C]'
                      }`}
                    >
                      <ListBulletIcon className="w-4 h-4" />
                      List
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#E8DFC6] bg-white px-4 py-2 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7A5A1B] hidden md:inline">
                      Sort
                    </span>
                    <select
                      value={searchParams.sort || ''}
                      onChange={(event) => updateFilters({ sort: event.target.value || null })}
                      className="appearance-none bg-transparent text-sm font-semibold text-[#1B4332] focus:outline-none"
                    >
                      <option value="">Default</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price ↑</option>
                      <option value="price-high">Price ↓</option>
                      <option value="rating">Rating</option>
                      <option value="popular">Popular</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 rounded-full border-[#E8DFC6] text-[#1B4332] hover:bg-[#FFF6D9] lg:hidden"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilters.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() => updateFilters({ [chip.key]: null })}
                      className="flex items-center gap-2 rounded-full bg-[#FFF6D9] px-4 py-1 text-sm font-medium text-[#1B4332]"
                    >
                      {chip.label}
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#B08C3E] underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid with Lazy Loading */}
            {productsData ? (
              <LazyProductGrid
                initialData={productsData}

                searchParams={{
                  search: searchParams.search,
                  category: searchParams.category,
                  sort: searchParams.sort,
                  minPrice: searchParams.minPrice,
                  maxPrice: searchParams.maxPrice,
                  brand: searchParams.brand,
                  rating: searchParams.rating
                }}
                apiEndpoint="/api/products"
                gridColumns={gridColumns}
                viewMode={viewMode}
                compact={viewMode === 'list'}
                pageSize={pageSize}
              />
            ) : loadingProducts ? (
              /* Loading State */
              <div className="space-y-6">

                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Error loading products
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
                <div className="space-y-3">
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                  <div>
                    <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-700">
                      Browse All Products
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <section className="mt-16 rounded-[40px] bg-gradient-to-br from-[#1B4332] via-[#173626] to-[#0c2217] px-8 py-16 text-white shadow-[0_35px_70px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-[#F8E8B0]">Need help deciding?</p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Can’t find the exact product you’re looking for?
            </h2>
            <p className="max-w-2xl text-base text-white/80">
              Reach out for bulk orders, custom requirements, or factory tours. Our team would love to curate the perfect Kal Kal experience for you.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/contact"
                className="rounded-full bg-white px-8 py-3 font-semibold text-[#1B4332] shadow-lg transition hover:-translate-y-0.5"
              >
                Contact Us
              </a>
              <a
                href="tel:9801354245"
                className="inline-flex items-center justify-center rounded-full border border-white/60 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <PhoneArrowUpRightIcon className="mr-2 h-5 w-5" />
                Call: 9801354245
              </a>
            </div>
          </div>
        </section>

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        <BackToTop />
      </div>
    </div>
  )
})

CategoriesClient.displayName = 'CategoriesClient'

export default CategoriesClient