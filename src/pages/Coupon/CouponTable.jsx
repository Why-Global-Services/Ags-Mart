import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import { Switch, Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  getCoupons,
  deleteCoupon,
  updateCouponStatus,
} from '../../Interceptor/interceptor';
import { toast } from 'react-toastify';

const CouponTable = () => {
  const [filterStatus, setFilterStatus] = useState('active');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const couponTypes = ['all', 'percentage', 'fixed'];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getCoupons();
      const data = response.data || response;
      const formatted = data.map((item) => ({
        ...item,
        offerType: item.offerType || "DISCOUNT",
        status: item.status, // Use the status field directly from API
        discount:
          item.discountType === 'percentage'
            ? `${item.discountValue}%`
            : `₹${item.discountValue}`,
        startDate: item.validFrom,
        endDate: item.validUntil,
        image: item.couponImage || null,
        message: item.message || item.description || '-',
        isCashback: item.cashBack,
      }));
      setCoupons(formatted);
      filterCoupons(filterStatus, selectedCategory, formatted, searchTerm);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = (
    status,
    type = selectedCategory,
    data = coupons,
    search = searchTerm
  ) => {
    setFilterStatus(status);
    setActiveTab(status);
    let filtered = data.filter(
      (coupon) => coupon.status.toLowerCase() === status.toLowerCase()
    );
    if (type !== 'all') {
      filtered = filtered.filter(
        (coupon) => coupon.discountType?.toLowerCase() === type.toLowerCase()
      );
    }
    if (search) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(search.toLowerCase()) ||
          coupon.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCoupons(filtered);
  };

  const handleCategoryChange = (e) => {
    const type = e.target.value;
    setSelectedCategory(type);
    filterCoupons(filterStatus, type, coupons, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterCoupons(filterStatus, selectedCategory, coupons, e.target.value);
  };

  const handleAddCoupoun = () => {
    navigate('/coupons/add');
  };

  const handleEditClick = (coupon) => {
    navigate(`/coupons/edit/${coupon._id}`);
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon._id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCoupon(couponToDelete);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
      console.error('Error deleting coupon:', error);
    } finally {
      setShowDeleteModal(false);
      setCouponToDelete(null);
    }
  };

  const handleToggleChange = async (checked, row) => {
    try {
      const newStatus = checked ? 'active' : 'inactive';
      await updateCouponStatus(row._id, newStatus);
      const updatedCoupons = coupons.map((coupon) =>
        coupon._id === row._id ? { ...coupon, status: newStatus } : coupon
      );
      setCoupons(updatedCoupons);
      filterCoupons(filterStatus, selectedCategory, updatedCoupons, searchTerm);
      toast.success('Coupon status updated');
    } catch (error) {
      toast.error('Failed to update coupon status');
      console.error('Error updating coupon status:', error);
    }
  };

  const handleViewClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
  };

  const columns = [
    {
      name: 'S No',
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Promo Code',
      selector: (row) => row.code,
      sortable: true,
      minWidth: '120px',
    },
    {
  name: "Type",
  selector: (row) => row.offerType,
  sortable: true,
  width: "140px",
},
    {
      name: 'Image',
      cell: (row) => (
        <img
          src={row.image || 'https://via.placeholder.com/50'}
          alt={row.code}
          className='w-10 h-10 rounded object-cover'
        />
      ),
      width: '100px',
    },
    {
      name: 'Message',
      selector: (row) => row.message,
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Start Date',
      selector: (row) => new Date(row.startDate).toLocaleDateString(),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: 'End Date',
      selector: (row) => new Date(row.endDate).toLocaleDateString(),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: 'Discount',
      selector: (row) => row.discount,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Status',
      cell: (row) => (
        <Switch
          checked={row.status.toLowerCase() === 'active'}
          onChange={(checked) => handleToggleChange(checked, row)}
          checkedChildren='Active'
          unCheckedChildren='Inactive'
        />
      ),
      width: '120px',
    },
    // {
    //   name: 'Is Cashback',
    //   selector: (row) => (row.isCashback ? 'Yes' : 'No'),
    //   sortable: true,
    //   width: '120px',
    // },
    {
      name: 'Actions',
      cell: (row) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleViewClick(row)}
            className='bg-gray-200 text-gray-600 p-2 rounded hover:bg-blue-200 cursor-pointer'
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className='bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200 cursor-pointer'
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className='bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer'
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      minWidth: '180px',
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: 'var(--color-table)', // Pink header background
        color: '#fff', // White text for headers
        fontWeight: '600',
        padding: '12px 10px',
        fontSize: '14px',
        lineHeight: '1.5',
        fontFamily: 'var(--font-fonttitle)',
        textAlign: 'center',
        justifyContent: 'center',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        
      },
    },
    cells: {
      style: {
        padding: '12px 10px',
        fontSize: '14px',
        fontFamily: 'var(--font-fontcontent)',
        textAlign: 'center',
        justifyContent: 'center',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        borderRight: '1px solid #e5e7eb', // Vertical border for cells
        '&:last-child': {
          borderRight: 'none', // Remove border for last cell in row
        },
      },
    },
    rows: {
      style: {
        borderBottom: '1px solid #e5e7eb', // Horizontal border for rows
        margin: '0',
        padding: '0',
        width: '100%',
        minHeight: '50px',
      },
    },
    table: {
      style: {
        width: '100%',
        tableLayout: 'fixed', // Fixed table layout for consistent column widths
        borderCollapse: 'collapse', // Ensure borders are merged
      },
    },
    subHeader: {
      style: {
        padding: '0',
        margin: '0',
      },
    },
  };

  return (
    <>
      <div className='p-4 w-full bg-gray-100 overflow-hidden'>
        <div className='bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md overflow-x-auto'>
          <div className='flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 px-8'>
            <h2 className='text-xl font-semibold text-gray-800 w-full text-center md:text-left'>
              Coupons
            </h2>
            <div className='flex space-x-2 w-full h-9 justify-end'>
              <button
                onClick={handleAddCoupoun}
                className='bg-table border border-primary w-full px-4 py-1 rounded-md hover:bg-secondary text-white  hover:text-white duration-500 cursor-pointer'
              >
                Add Coupons
              </button>
              <input
                type='text'
                placeholder='Search Coupon'
                value={searchTerm}
                onChange={handleSearchChange}
                className='border border-gray-300 p-2 rounded-md w-full md:w-72'
              />
              <select
                className='border border-gray-300 rounded-md p-2 w-full md:w-auto cursor-pointer'
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {couponTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all'
                      ? 'All Types'
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <select
                className='border border-gray-300 rounded-md p-2 w-full md:w-auto cursor-pointer'
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value='This Month'>This Month</option>
                <option value='Last Month'>Last Month</option>
              </select>
            </div>
          </div>

          <div className='w-full mb-5 px-8'>
            <div className='flex'>
              <div
                className={`cursor-pointer px-4 py-2 font-medium ${
                  activeTab === 'active'
                    ? 'text-secondary border-b-2 border-secondary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => filterCoupons('active')}
              >
                Active
              </div>
              <div
                className={`cursor-pointer px-4 py-2 font-medium ${
                  activeTab === 'inactive'
                    ? 'text-secondary border-b-2 border-secondary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => filterCoupons('inactive')}
              >
                Inactive
              </div>
            </div>
          </div>
          <div className='w-full overflow-x-auto rounded px-8'>
            <DataTable
              columns={columns}
              data={filteredCoupons}
              pagination
              paginationPerPage={rowsPerPage}
              paginationDefaultPage={currentPage}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newPerPage, page) => {
                setRowsPerPage(newPerPage);
                setCurrentPage(page);
              }}
              progressPending={loading}
              fixedHeaderScrollHeight='300px'
              customStyles={customStyles}
              highlightOnHover
              responsive
            />
          </div>
        </div>

        <Modal
          title='Confirm Delete'
          open={showDeleteModal}
          onOk={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          footer={[
            <Button key='back' onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>,
            <Button
              key='submit'
              type='primary'
              danger
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete this coupon?</p>
        </Modal>

        <Modal
          title='Coupon Details'
          open={showViewModal}
          onCancel={() => setShowViewModal(false)}
          footer={[
            <Button key='close' onClick={() => setShowViewModal(false)}>
              Close
            </Button>,
          ]}
        >
          {selectedCoupon && (
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <img
                  src={selectedCoupon.image || 'https://via.placeholder.com/50'}
                  alt={selectedCoupon.code}
                  className='w-16 h-16 rounded object-cover border'
                />
                <div>
                  <h3 className='text-lg font-bold text-gray-800'>
                    {selectedCoupon.code}
                  </h3>
                  <p className='text-gray-500'>{selectedCoupon.message}</p>
                </div>
              </div>
              <div>
                <strong>Status: </strong>
                {selectedCoupon.status.charAt(0).toUpperCase() +
                  selectedCoupon.status.slice(1)}
              </div>
              <div>
                <strong>Start Date: </strong>
                {new Date(selectedCoupon.startDate).toLocaleDateString()}
              </div>
              <div>
                <strong>End Date: </strong>
                {new Date(selectedCoupon.endDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Discount: </strong>
                {selectedCoupon.discount}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default CouponTable;