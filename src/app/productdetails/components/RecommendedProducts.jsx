import ProductCard from '@/app/component/CartUI'
import React from 'react'

const RecommendedProducts = ({ products }) => {
  const recommendedProducts = products || []
  
  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-medium text-gray-800 mb-6 pl-2 border-l-4 border-emerald-400">
          You May Also Like
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedProducts.map((product, index) => (
            <ProductCard 
              key={product.id || product._id || index} 
              product={product} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendedProducts