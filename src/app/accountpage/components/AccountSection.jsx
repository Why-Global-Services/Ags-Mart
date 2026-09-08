'use client';

import { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { FaUser, FaShoppingBag, FaLocationArrow, FaSignOutAlt, FaStopwatch, FaSpinner, FaMoneyBillWave, FaClock, FaHome, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { FaRegFaceGrinStars } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { TiShoppingCart } from "react-icons/ti";
import Loading from "@/app/common/Loading";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [ loading, setloading ] = useState(true)
  // const searchParams = useSearchParams();

  // URL-la irukura tab-ah check pannu
  // useEffect(() => {
  //   const tab = searchParams.get('tab');
  //   if (tab && ['dashboard', 'profile', 'orders', 'addresses'].includes(tab)) {
  //     setActiveTab(tab);
  //   }
  // }, [searchParams]);

  const [user, setUser] = useState({
    name: 'DhineshJoseph',
    email: 'dhinesjoseph@gmail.com',
    phone: '+91 98765 43210',
    joinDate: 'March 2023',
    loyaltyPoints: 1250,
    avatar: '/api/placeholder/100/100'
  });

  const [profile, setProfile] = useState({
    firstName: 'Joseph',
    lastName: 'Dhinesh',
    email: 'joseph123@gmail.com',
    phone: '+91 6385112245',
    address: '123 Green Valley, Nature Street',
    city: 'Chennai',
    pincode: '600001',
    newsletter: true,
    smsUpdates: false
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'Joseph Dhinesh',
      phone: '+91 6385112245',
      address: '123 Green Valley, Nature Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      name: 'Joseph Dhinesh',
      phone: '+91 9876543210',
      address: 'Tech Park, Office No. 45',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      isDefault: false
    }
  ]);

  const orders = [
    {
      id: 'KN23892',
      date: '15 Dec 2023',
      items: 3,
      amount: '₹2,499',
      status: 'Delivered',
      statusColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'KN23845',
      date: '28 Nov 2023',
      items: 2,
      amount: '₹1,799',
      status: 'Delivered',
      statusColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'KN23781',
      date: '12 Nov 2023',
      items: 5,
      amount: '₹4,299',
      status: 'Processing',
      statusColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const favorites = [
    { id: 1, name: 'Himalayan Face Cream', price: '₹899', image: 'https://i.ytimg.com/vi/eKIPGcylsJA/maxresdefault.jpg' },
    { id: 2, name: 'Neem & Turmeric Soap', price: '₹349', image: '/bodycare.jpg' },
    { id: 3, name: 'Lavender Essential Oil', price: '₹1,299', image: '/combo.jpg' }
  ];


  const LogoutModal = () => {
    if (!showLogoutConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-80 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout?</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                alert("You have been logged out!");
              }}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleAddNewAddress = () => {
    alert('Add new address functionality would go here!');
  };

  const handleSetDefaultAddress = (id) => {
    const updatedAddresses = addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    }));
    setAddresses(updatedAddresses);
    alert('Default address updated!');
  };

  const handleDeleteAddress = (id) => {
    if (addresses.find(addr => addr.id === id)?.isDefault) {
      alert('Cannot delete default address!');
      return;
    }
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
    alert('Address deleted!');
  };

  if (loading) {
    return <Loading text="Loading account details..." subtext="Accessing your profile & farm orders" />;
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">
            My <span className="text-emerald-800">Account</span>
          </h1>
          <p className="text-lg text-gray-600">Manage your profile, orders, and preferences</p>
          <div className="w-24 h-1 bg-emerald-800 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-emerald-100 sticky top-8">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <img
                    src="/combo.jpg"
                    alt={user.name}
                    className="w-28 h-28 rounded-full border-4 border-bgvariant-2 mx-auto object-cover"
                  />
                  <div className="absolute bottom-0 right-3 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <h3 className="text-xl font-bold text-emerald-800">{user.name}</h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <div className="mt-3 bg-emerald-50 rounded-full px-4 py-2 inline-flex items-center">
                  <div className='flex justify-center items-center gap-2 text-xl'>
                    <span><FaRegFaceGrinStars className='text-yellow-400' /></span>
                    <span className="text-emerald-600 font-semibold">{user.loyaltyPoints} Points</span>
                  </div>
                </div>
              </div>
              <nav className="space-y-2">
                {[
                  // { id: 'dashboard', label: 'Dashboard', icon: <RxDashboard className="text-lg" /> },
                  { id: 'profile', label: 'Profile', icon: <FaUser className="text-lg" /> },
                  { id: 'orders', label: 'My Orders', icon: <FaShoppingBag className="text-lg" /> },
                  { id: 'addresses', label: 'Addresses', icon: <FaLocationArrow className="text-lg" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                      ? 'bg-emerald-800 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-bgvariant-2'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 mt-4"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-emerald-800 rounded-3xl p-8 text-white shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!!!</h2>
                      <p className="text-white">Here's what's happening with your account today</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-white/20 rounded-2xl px-6 py-4 text-center">
                      <div className="text-2xl font-bold">{user.loyaltyPoints}</div>
                      <div className="text-sm opacity-90">Loyalty Points</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Total Orders</p>
                        <h3 className="text-2xl font-bold text-emerald-800 mt-1">12</h3>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <FaShoppingBag className="text-xl text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Pending Orders</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-1">1</h3>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <FaClock className="text-xl text-amber-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600">Total Spent</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">₹18,456</h3>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <FaMoneyBillWave className="text-xl text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                    <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center">
                      <FaShoppingBag className="mr-2" />
                      Recent Orders
                    </h3>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-emerald-800">#{order.id}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-800">{order.amount}</p>
                            <p className={`text-sm font-medium ${order.statusColor}`}>{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full mt-4 py-3 text-emerald-600 font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-all duration-300"
                    >
                      View All Orders
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                    <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center">
                      <FaRegFaceGrinStars className="mr-2 text-yellow-400" />
                      My Favorites
                    </h3>
                    <div className="space-y-4">
                      {favorites.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="font-semibold text-emerald-800">{item.name}</p>
                            <p className="text-amber-600 font-bold">{item.price}</p>
                          </div>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
                            <span><TiShoppingCart className='text-xl' /></span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 animate-fadeIn">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                  <FaUser className="mr-3" />
                  Profile Information
                </h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-bgvariant-2 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bgvariant-2 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bgvariant-2 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-bgvariant-2 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-bgvariant-2 mb-2">Address</label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bgvariant-2 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={profile.pincode}
                        onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                        className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-emerald-50/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-emerald-100">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profile.newsletter}
                          onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Subscribe to newsletter</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profile.smsUpdates}
                          onChange={(e) => setProfile({ ...profile, smsUpdates: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Receive SMS updates</span>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="text-white bg-emerald-800 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 animate-fadeIn">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center">
                  <FaShoppingBag className="mr-3" />
                  Order History
                </h2>

                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-emerald-800">Order #{order.id}</h3>
                          <p className="text-gray-600">Placed on {order.date}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.statusColor} ${order.bgColor}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl"><FaShoppingBag className='text-emerald-800' /></div>
                            <p className="text-sm text-gray-600">{order.items} items</p>
                          </div>
                          <div className="h-8 w-px bg-emerald-200"></div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-emerald-800">{order.amount}</div>
                            <p className="text-sm text-gray-600">Total amount</p>
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex space-x-3">
                          <button className="px-4 py-2 border border-emerald-200 text-bgvariant-2 rounded-xl hover:bg-emerald-50 transition-all duration-300">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FaLocationArrow className="text-2xl text-emerald-600" />
                    <h2 className="text-2xl font-bold text-emerald-800">My Addresses</h2>
                  </div>
                  <button
                    onClick={handleAddNewAddress}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-bgvariant-2 transition-all duration-200"
                  >
                    <FaPlus className="text-sm" />
                    Add New Address
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {addresses.map((address) => (
                    <div key={address.id} className={`border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${address.isDefault ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'
                      }`}>
                      <div className="flex items-center gap-3 mb-4">
                        {address.type === 'Home' ? (
                          <FaHome className="text-emerald-600 text-2xl" />
                        ) : (
                          <FaLocationDot className="text-blue-600 text-2xl" />
                        )}
                        <h3 className="font-semibold text-emerald-800">{address.type}</h3>
                        {address.isDefault && (
                          <span className="ml-auto bg-emerald-100 text-bgvariant-2 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-gray-600 mb-4">
                        <p className="font-medium text-gray-800">{address.name}</p>
                        <p>{address.phone}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-bgvariant-2"
                          >
                            <FaEdit className="text-xs" />
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-auto"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LogoutModal />
    </div>
  );
};

export default AccountPage;