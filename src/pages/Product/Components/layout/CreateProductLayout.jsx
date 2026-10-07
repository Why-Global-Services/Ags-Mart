import { Link } from "react-router-dom";

const CreateProductLayout = ({ isEdit, children }) => (
  <div className="bg-gradient-to-br from-[#f8faf8] via-[#f0f7f2] to-[#e8f3ec] min-h-screen p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
          {isEdit ? "Edit Product" : "Create Product"}
        </h1>
        <p className="text-sm text-gray-600 mt-0.5">
          {isEdit ? "Update agriculture product details, pricing, and variants" : "Add a new agriculture product to the catalogue"}
        </p>
      </div>
      <Link to="/products">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 bg-white/80 hover:bg-emerald-50 border border-emerald-200/60 shadow-sm transition-all cursor-pointer">
          ← Back to Products
        </button>
      </Link>
    </div>
    <div className="w-full">
      {children}
    </div>
  </div>
);

export default CreateProductLayout;