import { useState, useEffect } from 'react';
import { getUser, updateUser } from '../../Interceptor/interceptor';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editableData, setEditableData] = useState({
    userName: '',
    mobileNumber: '',
    Address: '',
    additionalEmail: '',
    primaryEmail: ''
  });

  const [profileData, setProfileData] = useState({
    role: '',
    userRole: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = "20d8a127-6c5e-469a-91f3-ee78a80cc33e";
        const response = await getUser(userId);

        if (!response) {
          throw new Error("User data not found");
        }

        setEditableData({
          userName: response.userName || '',
          mobileNumber: response.mobileNumber || '',
          Address: response.Address || '',
          additionalEmail: response.additionalEmail || '',
          primaryEmail: response.email || ''
        });

        setProfileData({
          role: response.role || 'Admin',
          userRole: response.userRole || '',
          email: response.email || ''
        });

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const email = editableData.additionalEmail;

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Please enter a valid additional email address");
        return;
      }

      setLoading(true);
      const userId = "20d8a127-6c5e-469a-91f3-ee78a80cc33e";

      const updatedData = {
        userName: editableData.userName,
        mobileNumber: editableData.mobileNumber,
        Address: editableData.Address,
        additionalEmail: editableData.additionalEmail,
        email: editableData.primaryEmail
      };

      const response = await updateUser(userId, updatedData);

      if (!response) {
        throw new Error("Failed to update profile");
      }

      // Update profile data
      setProfileData(prev => ({
        ...prev,
        ...updatedData
      }));

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto p-4 bg-white rounded-lg shadow-sm px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profile Information</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal details</p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-48 h-10 bg-table text-white cursor-pointer border border-table px-4 py-2 rounded-md hover:bg-secondary hover:text-white duration-500 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border  border-gray-300 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-48 h-10 bg-white border border-table px-4 py-2 rounded-md hover:bg-secondary hover:text-white duration-500 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {loading && !isEditing ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="userName"
                value={editableData.userName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={editableData.mobileNumber}
                required
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="Address"
                value={editableData.Address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
              <input
                type="email"
                name="primaryEmail"
                value={editableData.primaryEmail}
                onChange={handleInputChange}
                required
                placeholder="Enter primary email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Email</label>
              <input
                type="email"
                name="additionalEmail"
                value={editableData.additionalEmail}
                onChange={handleInputChange}
                required
                placeholder="Enter additional email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-pink-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-pink-700">{editableData.userName}</h2>
            <p className="text-pink-600">{profileData.role} {profileData.userRole && `• ${profileData.userRole}`}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Primary Email</p>
                  <p className="text-gray-900 font-medium">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Additional Email</p>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium">
                      {editableData.additionalEmail || 'Not added'}
                    </p>
                    {!editableData.additionalEmail && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mobile Number</p>
                  <p className="text-gray-900 font-medium">{editableData.mobileNumber || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Shipping Address</p>
                  <p className="text-gray-900 font-medium">
                    {editableData.Address || 'Not specified'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-pink-600 cursor-pointer text-sm hover:underline flex items-center gap-1 mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Update address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;