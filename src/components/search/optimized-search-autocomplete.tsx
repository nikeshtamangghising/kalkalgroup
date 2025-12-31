'use client'

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/hooks/use-performance'

interface SearchSuggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand'
  count?: number
}

interface OptimizedSearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const OptimizedSearchAutocomplete = memo(({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  className = '',
  disabled = false
}: OptimizedSearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  // Debounce search queries to avoid excessive API calls
  const debouncedValue = useDebounce(value, 300)

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedValue.trim().length >= 2) {
      fetchSuggestions(debouncedValue)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedValue])

  // Memoized fetch function
  const fetchSuggestions = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
  }, [onChange])

  // Handle search submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
      setShowSuggestions(false)
    }
  }, [value, onSearch])

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    onSearch(suggestion.text)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [onChange, onSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick, handleSubmit])

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [suggestions.length])

  // Handle input blur
  const handleBlur = useCallback(() => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }, 200)
  }, [])

  // Memoized suggestion items
  const suggestionItems = useMemo(() => {
    return suggestions.map((suggestion, index) => (
      <button
        key={suggestion.id}
        type="button"
        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
          index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
        }`}
        onClick={() => handleSuggestionClick(suggestion)}
      >
        <div className="flex items-center space-x-3">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{suggestion.text}</span>
          <span className="text-xs text-gray-500 capitalize">
            {suggestion.type}
          </span>
        </div>
        {suggestion.count && (
          <span className="text-xs text-gray-400">
            {suggestion.count} results
          </span>
        )}
      </button>
    ))
  }, [suggestions, selectedIndex, handleSuggestionClick])

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="block w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          </div>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
        >
          <div className="py-2">
            {suggestionItems}
          </div>
        </div>
      )}
    </div>
  )
})

OptimizedSearchAutocomplete.displayName = 'OptimizedSearchAutocomplete'

export default OptimizedSearchAutocomplete