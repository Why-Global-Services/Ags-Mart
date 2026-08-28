// app/shoppage/page.js
import React, { Suspense } from 'react'
import Shopping from "./components/ShopPage"

const Page = () => {
  return (
    <div>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      }>
        <Shopping />
      </Suspense>
    </div>
  )
}

export default Page