'use client'

import { useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'

type GalleryImagePreviewProps = {
  imageUrl?: string | null
  title: string
  category: string
  isActive?: boolean
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80'

const GalleryImagePreview = ({
  imageUrl,
  title,
  category,
  isActive = true,
}: GalleryImagePreviewProps) => {
  const [hasError, setHasError] = useState(!imageUrl)
  const [loaded, setLoaded] = useState(false)

  const displaySrc = !hasError && imageUrl ? imageUrl : FALLBACK_IMAGE

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      <img
        src={displaySrc}
        alt={title}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
          loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true)
            setLoaded(false)
          }
        }}
      />

      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
          <PhotoIcon className="h-10 w-10" />
          <span className="text-xs font-semibold uppercase tracking-wide">Loading preview…</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/5 to-transparent pointer-events-none" />

      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide shadow-sm ${
            isActive
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-sm">
          {category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900/70 to-transparent p-3">
        <p className="text-sm font-semibold text-white line-clamp-1">{title}</p>
      </div>
    </div>
  )
}

export default GalleryImagePreview
