import React, { useState } from "react";
import { FaEye, FaPlusCircle, FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ActionsMenu = ({
  item,
  onView,
  onAssign,
  onDelete,
  editPath,
  assignPath,
  showView = true,
  showAssign = true,
  showEdit = true,
  showDelete = true,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (e) => {
    e.preventDefault();
    if (editPath) {
      navigate(editPath, { state: { offerData: item } });
    }
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete && onDelete(item._id);
    setShowDeleteModal(false);
  };
  
  return (
    <>
      <div className="flex space-x-2">
        {showView && (
          <div
            onClick={() => onView && onView(item)}
            className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
            title="View Details"
          >
            <FaEye />
          </div>
        )}
        
        {showAssign && (
          <div
            onClick={() => navigate(assignPath)}
            className="relative group bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200 flex items-center"
            title="Assign"
          >
            <FaPlusCircle />
            <div className="absolute -top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Assign
            </div>
          </div>
        )}

        {showEdit && (
          <button
            onClick={handleEdit}
            className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200"
            title="Edit"
          >
            <FaEdit />
          </button>
        )}
        
        {showDelete && (
          <button
            onClick={handleDeleteClick}
            className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer"
            title="Delete"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/70 z-40"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 pointer-events-auto">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ActionsMenu;