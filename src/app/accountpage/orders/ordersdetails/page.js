import React, { Suspense } from 'react'
import OrderDetailsMain from './components/OrderDetailsMain'

const Page = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading order details...</div>}>
      <OrderDetailsMain />
    </Suspense>
  )
}

export default Page