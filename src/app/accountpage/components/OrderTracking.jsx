'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaShoppingBag, FaTruck, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

const OrderTracking = ({ orderId }) => {
  const router = useRouter();
  
  // Sample tracking data
  const [trackingInfo] = useState({
    orderId: orderId || 'KN23892',
    status: 'shipped',
    estimatedDelivery: '20 Dec 2023',
    trackingNumber: 'TRK123456789',
    carrier: 'BlueDart Express',
    steps: [
      { 
        status: 'ordered', 
        title: 'Order Placed', 
        description: 'Your order has been confirmed',
        date: '15 Dec 2023, 10:30 AM',
        completed: true 
      },
      { 
        status: 'confirmed', 
        title: 'Order Confirmed', 
        description: 'Seller has processed your order',
        date: '15 Dec 2023, 02:15 PM',
        completed: true 
      },
      { 
        status: 'shipped', 
        title: 'Shipped', 
        description: 'Your order has been shipped',
        date: '16 Dec 2023, 09:45 AM',
        completed: true,
        current: true 
      },
      { 
        status: 'out_for_delivery', 
        title: 'Out for Delivery', 
        description: 'Your order is out for delivery',
        date: 'Estimated 20 Dec 2023',
        completed: false 
      },
      { 
        status: 'delivered', 
        title: 'Delivered', 
        description: 'Your order has been delivered',
        date: '',
        completed: false 
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-bgvariant-2 hover:text-emerald-800 transition-colors"
          >
            <FaArrowLeft className="text-lg" />
            <span>Back to Orders</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 md:p-8">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-2">
                Order #{trackingInfo.orderId}
              </h1>
              <p className="text-gray-600">Tracking your package</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-semibold">
                {trackingInfo.status.charAt(0).toUpperCase() + trackingInfo.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <FaTruck className="text-emerald-600 text-xl" />
                <h3 className="font-semibold text-gray-800">Carrier</h3>
              </div>
              <p className="text-gray-600">{trackingInfo.carrier}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <FaShoppingBag className="text-emerald-600 text-xl" />
                <h3 className="font-semibold text-gray-800">Tracking Number</h3>
              </div>
              <p className="text-gray-600 font-mono">{trackingInfo.trackingNumber}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <FaMapMarkerAlt className="text-emerald-600 text-xl" />
                <h3 className="font-semibold text-gray-800">Estimated Delivery</h3>
              </div>
              <p className="text-gray-600">{trackingInfo.estimatedDelivery}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-emerald-800 mb-6">Order Status</h2>
            
            <div className="space-y-6">
              {trackingInfo.steps.map((step, index) => (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : step.current
                        ? 'border-emerald-500 bg-white text-emerald-500'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      {step.completed ? (
                        <FaCheckCircle className="text-lg" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < trackingInfo.steps.length - 1 && (
                      <div className={`flex-1 w-0.5 mt-2 ${
                        step.completed ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-6">
                    <div className={`${step.current ? 'bg-emerald-50' : ''} p-4 rounded-xl`}>
                      <h3 className={`font-semibold ${
                        step.completed || step.current ? 'text-emerald-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{step.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Details */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-emerald-800 mb-4">Package Details</h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Items in this shipment</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Wireless Bluetooth Headphones (Qty: 2)</li>
                    <li>• Smart Watch Series 5 (Qty: 1)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                  <p className="text-gray-600">
                    Joseph Dhinesh<br />
                    123 Green Valley, Nature Street<br />
                    Chennai, Tamil Nadu - 600001<br />
                    +91 6385112245
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;