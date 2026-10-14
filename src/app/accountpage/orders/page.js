import React, { Suspense } from 'react'
import Orders from './components/Orders'

const Page = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading orders...</div>}>
      <Orders />
    </Suspense>
  )
}

export default Page