import { Link } from "react-router-dom";

const CreateProductLayout = ({ isEdit, children }) => (
  <div className="bg-gray-50 min-h-screen p-6">
    <h1 className="text-3xl font-title text-gray-800">
      {isEdit ? "Edit Product" : "Create Product"}
    </h1>
    <Link to="/products">
      <button className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer">
        ← Go back
      </button>
    </Link>
    <div className="flex gap-6 mt-4">
      {children}
    </div>
  </div>
);

export default CreateProductLayout;