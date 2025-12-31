type GalleryItem = {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  altText: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

type GalleryInsert = Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>

const STORE_KEY = '__galleryFallbackStore__'

const initialGalleryData: GalleryItem[] = [
  {
    id: '1',
    title: 'Main Production Facility',
    description: 'Our state-of-the-art 50,000+ liters daily capacity production facility',
    category: 'Factory',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    altText: 'Main Production Facility',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    title: 'Quality Control Laboratory',
    description: 'Advanced testing equipment ensuring product quality and safety',
    category: 'Factory',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    altText: 'Quality Control Laboratory',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },
  {
    id: '3',
    title: 'Oil Extraction Process',
    description: 'Traditional cold-pressing method for premium mustard oil',
    category: 'Production',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop',
    altText: 'Oil Extraction Process',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T10:00:00Z'),
  },
  {
    id: '4',
    title: 'Premium Mustard Oil',
    description: 'Our flagship cold-pressed mustard oil with authentic taste',
    category: 'Products',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=400&fit=crop',
    altText: 'Premium Mustard Oil',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date('2024-01-18T10:00:00Z'),
    updatedAt: new Date('2024-01-18T10:00:00Z'),
  },
  {
    id: '5',
    title: 'Our Production Team',
    description: 'Skilled professionals ensuring quality at every step',
    category: 'Team',
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
    altText: 'Our Production Team',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date('2024-01-19T10:00:00Z'),
    updatedAt: new Date('2024-01-19T10:00:00Z'),
  },
  {
    id: '6',
    title: 'ISO Certification',
    description: 'International quality standards certification',
    category: 'Awards',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop',
    altText: 'ISO Certification',
    isActive: true,
    sortOrder: 6,
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z'),
  },
]

type GalleryGlobal = typeof globalThis & {
  [STORE_KEY]?: GalleryItem[]
}

function getStore(): GalleryItem[] {
  const globalWithStore = globalThis as GalleryGlobal

  if (!globalWithStore[STORE_KEY]) {
    // Clone to avoid mutations of the original sample data reference
    globalWithStore[STORE_KEY] = initialGalleryData.map((item) => ({ ...item }))
  }

  return globalWithStore[STORE_KEY]!
}

interface ListOptions {
  category?: string | null
  activeOnly?: boolean
}

export function listFallbackGalleryItems(options: ListOptions = {}): GalleryItem[] {
  const store = getStore()
  const { category, activeOnly } = options

  return store.filter((item) => {
    const matchesCategory =
      !category || category === 'all' ? true : item.category === category
    const matchesActive = activeOnly ? item.isActive : true
    return matchesCategory && matchesActive
  })
}

export function getFallbackGalleryItem(id: string): GalleryItem | undefined {
  const store = getStore()
  return store.find((item) => item.id === id)
}

export function createFallbackGalleryItem(data: GalleryInsert): GalleryItem {
  const store = getStore()
  const now = new Date()

  const newItem: GalleryItem = {
    id: globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: data.title!,
    description: data.description ?? null,
    category: data.category!,
    imageUrl: data.imageUrl!,
    altText: data.altText ?? data.title ?? null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? store.length + 1,
    createdAt: now,
    updatedAt: now,
  }

  store.push(newItem)
  return newItem
}

export function updateFallbackGalleryItem(
  id: string,
  updates: Partial<GalleryInsert>
): GalleryItem | null {
  const store = getStore()
  const index = store.findIndex((item) => item.id === id)

  if (index === -1) {
    return null
  }

  const updatedItem: GalleryItem = {
    ...store[index],
    ...updates,
    updatedAt: new Date(),
  }

  store[index] = updatedItem
  return updatedItem
}

export function deleteFallbackGalleryItem(id: string): boolean {
  const store = getStore()
  const index = store.findIndex((item) => item.id === id)

  if (index === -1) {
    return false
  }

  store.splice(index, 1)
  return true
}
