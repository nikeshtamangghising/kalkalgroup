import { redirect } from 'next/navigation'

// Redirect old /categories route to /products
interface CategoriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  // Next.js App Router: searchParams is now async
  const searchParamsValue = await searchParams

  const params = new URLSearchParams()

  const search = searchParamsValue?.search as string
  const category = searchParamsValue?.category as string
  const page = searchParamsValue?.page as string
  const sort = searchParamsValue?.sort as string
  const minPrice = searchParamsValue?.minPrice as string
  const maxPrice = searchParamsValue?.maxPrice as string
  const brand = searchParamsValue?.brand as string
  const rating = searchParamsValue?.rating as string

  if (search) params.set('search', search)
  if (category) params.set('category', category)
  if (page) params.set('page', page)
  if (sort) params.set('sort', sort)
  if (minPrice) params.set('minPrice', minPrice)
  if (maxPrice) params.set('maxPrice', maxPrice)
  if (brand) params.set('brand', brand)
  if (rating) params.set('rating', rating)

  const redirectUrl = params.toString()
    ? `/products?${params.toString()}`
    : '/products'

  redirect(redirectUrl)
}
