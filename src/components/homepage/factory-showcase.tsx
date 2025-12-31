'use client'

import { memo } from 'react'
import { SparklesIcon, HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const FactoryShowcase = memo(() => {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Our Story & Products
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Premium Food Products Factory
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At Kal Kal Group, we craft pure and authentic Nepali food products—especially premium mustard oil—along with quality daal, grains, flours, and natural essentials. 
            From our factory to your kitchen, we deliver purity, taste, and trust in every product.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content - Factory Story */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Our Heritage</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Founded in 2074 BS, Kal Kal Group has been dedicated to producing the finest cooking oils and natural food products. 
                From a small local operation, we have grown into a trusted Nepali brand, committed to quality, purity, and traditional values.
              </p>
              <div className="flex items-center text-orange-600 font-semibold">
                <span>Since 2074 BS</span>
                <span className="mx-3">•</span>
                <span>Quality You Can Trust</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">Quality Promise</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every batch of our cooking oils and food products undergoes strict quality checks. We use only the finest 
                raw materials and modern, hygienic processing methods to ensure purity, freshness, and nutritional value.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-600">Pure &amp; Natural</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">✓</div>
                  <div className="text-sm text-gray-600">Hygienically Processed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">★</div>
                  <div className="text-sm text-gray-600">Trusted Quality</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Factory Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                {/* Placeholder for factory image */}
                <div className="text-center text-white">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-2">Our Factory</h4>
                  <p className="text-white/90">State-of-the-art facility</p>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-gray-600">Liters/Day</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">25+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
            <div className="text-gray-600">Oil Varieties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
            <div className="text-gray-600">Cities Served</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
})

FactoryShowcase.displayName = 'FactoryShowcase'

export default FactoryShowcase