import { useState } from 'react';
import { Modal, Rate } from 'antd';

const ReviewModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // Here you would typically handle the review submission
    console.log({ rating, reviewText });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-button text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[120px]"
      >
        Write Review
      </button>

      <Modal
        title="Write a Review"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Submit Review"
        cancelText="Cancel"
        width={600}
      >
        <div className="space-y-6">
          {/* Rating Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Give your rating</h2>
            <div className="flex items-center space-x-4">
              <Rate 
                value={rating} 
                onChange={setRating} 
                className="text-2xl" 
              />
              {rating > 0 && (
                <span className="text-gray-600">
                  {rating} star{rating !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          </div>

          {/* Review Text Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Your review</h2>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Share your experience with this product..."
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Add a Photo</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex justify-center text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
            </div>

            {/* Image Instructions */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Image instructions</h3>
              <ol className="mt-2 text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>Please ensure that the images uploaded are relevant to the product. You can upload product images or image of a person with the product applied.</li>
                <li>Irrelevant/obscene/poor quality images will not be approved during our screening process.</li>
              </ol>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReviewModal;