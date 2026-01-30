// components/PrintableInvoice.js
import React from "react";
import dayjs from "dayjs";

const PrintableInvoice = React.forwardRef(({ order }, ref) => {
  const getProductsFromOrder = (order) => {
    if (!order?.orderDetails?.products) return [];
    return order.orderDetails.products;
  };

  const products = getProductsFromOrder(order);

  return (
    <div ref={ref} className="p-8 bg-white">
      {/* Invoice Header */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
        <p className="text-gray-600 text-sm">Order ID: {order?.orderId}</p>
        <p className="text-gray-600 text-sm">
          Date: {dayjs(order?.createdAt).format("DD/MM/YYYY hh:mm A")}
        </p>
      </div>

      {/* Company & Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">From:</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-bold">Natures Hunt</p>
            <p>Company Address Line 1</p>
            <p>Company Address Line 2</p>
            <p>City, State - ZIP Code</p>
            <p>Phone: +91 9876543210</p>
            <p>Email: info@company.com</p>
          </div>
        </div> */}

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Bill To:</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-bold">{order?.userDetails?.name || "N/A"}</p>
            <p>Email: {order?.userDetails?.email || "N/A"}</p>
            {order?.deliveryAddress && (
              <>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.landMark && (
                  <p>{order.deliveryAddress.landMark}</p>
                )}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </p>
                <p>
                  {order.deliveryAddress.country} -{" "}
                  {order.deliveryAddress.zipCode}
                </p>
                <p>Phone: {order.deliveryAddress.phone}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Order Status</p>
            <p className="font-semibold">{order?.orderStatus}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Payment Status</p>
            <p className="font-semibold">{order?.paymentStatus}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-semibold">{order?.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Products Ordered
        </h2>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Product</th>
              <th className="border border-gray-300 p-2 text-left">Code</th>
              <th className="border border-gray-300 p-2 text-left">Price</th>
              <th className="border border-gray-300 p-2 text-left">Qty</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">
                  <div>
                    <p className="font-medium">{product.productTitle}</p>
                    {product.selectedVariant?.productTitle && (
                      <p className="text-sm text-gray-600">
                        {product.selectedVariant.productTitle}
                      </p>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  {product?.selectedVariant?.productCode || "N/A"}
                </td>
                <td className="border border-gray-300 p-2">₹{product.price}</td>
                <td className="border border-gray-300 p-2">{product.quantity}</td>
                <td className="border border-gray-300 p-2">
                  {product.orderStatus || "N/A"}
                </td>
                <td className="border border-gray-300 p-2">₹{product.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              {order?.totalPrice < 499 ? <span>₹{order?.totalPrice - 50}</span> : <span>₹{order?.totalPrice}</span>}
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Shipping:</span>
              {order?.totalPrice < 499 ? <span>₹50</span> : <span>Free</span>}
            </div>
            {/* <div className="flex justify-between mb-2">
              <span className="font-medium">Tax:</span>
              <span>₹0.00</span>
            </div> */}
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total Amount:</span>
              <span>₹{order?.totalPrice || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          For any queries, contact: info@natureshunt.in | +91 8747099499 
        </p>
        <p className="mt-4">
          Invoice generated on: {dayjs().format("DD/MM/YYYY hh:mm A")}
        </p>
      </div>
    </div>
  );
});

PrintableInvoice.displayName = "PrintableInvoice";

export default PrintableInvoice;