import React, { useState, useEffect } from "react";
import { Switch } from "antd";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import DataTable from "react-data-table-component";
import { getTimeSlot, createTimeSlot, getHolidayTimeSlot, createHolidayDateSlot, updateHolidayTimeSlot, deleteHolidayTimeSlot } from "../services/Services";
import { toast } from "react-toastify";

const TimeSlots = () => {
  const [formData, setFormData] = useState({
    shippingStartFrom: "today",
    expectedDeliveryDays: 1,
    timeSlotStatus: false,
  });
  const [holidayFormData, setHolidayFormData] = useState({
    title: "",
    fromDate: "",
    toDate: "",
    startDate: "",
    status: "active",
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [holidayTimeSlots, setHolidayTimeSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [currentSettings, setCurrentSettings] = useState({
    status: "Disabled",
    startsFrom: "Not set",
    allowedDays: "Not set",
  });

  // Fetch regular time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await getTimeSlot();
        if (response.data) {
          const data = response.data || response.data;
          setTimeSlots([data]);
          
          const formattedStartFrom = data.shippingStartFrom 
            ? data.shippingStartFrom.charAt(0).toUpperCase() + data.shippingStartFrom.slice(1)
            : "Not set";
            
          setFormData({
            shippingStartFrom: data.shippingStartFrom || "today",
            expectedDeliveryDays: data.expectedDeliveryDays || 1,
            timeSlotStatus: data.timeSlotStatus || false,
          });
          
          setCurrentSettings({
            status: data.timeSlotStatus ? "Enabled" : "Disabled",
            startsFrom: formattedStartFrom,
            allowedDays: data.expectedDeliveryDays || "Not set"
          });
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };
    fetchTimeSlots();
  }, []);

  const fetchHolidayTimeSlots = async () => {
    try {
      const response = await getHolidayTimeSlot();
      const data = Array.isArray(response.data) ? response.data : response.data || [];
      setHolidayTimeSlots(
        data.map((slot) => ({
          ...slot,
          status: slot.status === "true" || slot.status === "active" ? "active" : "inactive",
        }))
      );
    } catch (error) {
      console.error("Error fetching holiday time slots:", error);
    }
  };

  // Fetch holiday time slots
  useEffect(() => {
    fetchHolidayTimeSlots();
  }, []);

  // Handle regular time slot input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle holiday time slot input changes
  const handleHolidayInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "status" ? (value === "true" ? "active" : "inactive") : value;
    setHolidayFormData((prev) => ({ ...prev, [name]: newValue }));
    setError("");
  };

  // Handle switch change
  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, timeSlotStatus: checked }));
  };

  // Handle regular time slot save
  const handleSave = async () => {
    try {
      const payload = {
        shippingStartFrom: formData.shippingStartFrom.toLowerCase(),
        expectedDeliveryDays: parseInt(formData.expectedDeliveryDays),
        timeSlotStatus: formData.timeSlotStatus,
      };
      const response = await createTimeSlot(payload);
      console.log(response, " tiosnfw rewnrfw");
      if (response.success) {
        const data = response.data.data ?? response.data;
        setTimeSlots([data]);
        
        const formattedStartFrom = data.shippingStartFrom 
          ? data.shippingStartFrom.charAt(0).toUpperCase() + data.shippingStartFrom.slice(1)
          : "Not set";
        
        setCurrentSettings({
          status: data.timeSlotStatus ? "Enabled" : "Disabled",
          startsFrom: formattedStartFrom,
          allowedDays: data.expectedDeliveryDays || "Not set"
        });
        toast.success("Delivery Settings Updated Successfully")
      }

    } catch (error) {
      console.error("Error creating time slot:", error);
    }
  };

  // Handle holiday time slot save or update
  const handleAddSlot = async () => {
    const { title, fromDate, toDate, startDate } = holidayFormData;
    if (!title || !fromDate || !toDate || !startDate) {
      return;
    }

    const payload = {
      title,
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
      startDate: new Date(startDate).toISOString(),
      status: holidayFormData.status,
    };

    try {
      let response;
      if (editingSlotId) {
        // Update existing slot
        response = await updateHolidayTimeSlot(editingSlotId, payload);
        if (response.success) {
          setHolidayTimeSlots((prev) =>
            prev.map((slot) =>
              slot._id === editingSlotId
                ? {
                    ...response?.data,
                    status:
                        response?.data?.status === "active"
                        ? "active"
                        : "inactive",
                  }
                : slot
            )
          );
          handleHolidayReset();
          fetchHolidayTimeSlots();
          toast.success("Holiday Time Slot Updated")
        }
      } else {
        // Create new slot
        response = await createHolidayDateSlot(payload);
        if (response.success) {
          setHolidayTimeSlots((prev) => [
            ...prev,
            {
              ...response.data,
              status:
                 response.data.status === "active"
                  ? "active"
                  : "inactive",
            },
          ]);
          handleHolidayReset();
          fetchHolidayTimeSlots();
          toast.success("Holiday Time Slot Added")
        }
      }
    } catch (error) {
      console.error("Error processing holiday time slot:", error);
    }
  };

  // Handle regular time slot reset
  const handleReset = () => {
    const currentData = timeSlots[0] || {};
    setFormData({
      shippingStartFrom: currentData.shippingStartFrom || "today",
      expectedDeliveryDays: currentData.expectedDeliveryDays || 1,
      timeSlotStatus: currentData.timeSlotStatus || false,
    });
  };

  // Handle holiday time slot reset
  const handleHolidayReset = () => {
    setHolidayFormData({
      title: "",
      fromDate: "",
      toDate: "",
      startDate: "",
      status: "active",
    });
    setError("");
    setEditingSlotId(null);
  };

  // Handle holiday time slot delete
  const handleHolidayDeleteClick = async (id) => {
    try {
      const response = await deleteHolidayTimeSlot(id);
      if (response.success) {
        setHolidayTimeSlots((prev) => prev.filter((slot) => slot._id !== id));
      }
    } catch (error) {
      console.error("Error deleting holiday time slot:", error);
    }
  };

  // Handle holiday time slot edit
  const handleHolidayEditClick = (slot) => {
    setHolidayFormData({
      title: slot.title,
      fromDate: slot.fromDate.split("T")[0],
      toDate: slot.toDate.split("T")[0],
      startDate: slot.startDate.split("T")[0],
      status: slot.status,
    });
    setEditingSlotId(slot._id);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter holiday time slots based on search term
  const filteredHolidaySlots = holidayTimeSlots.filter((slot) =>
    slot.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log("Component mounted or currentSettings changed", currentSettings);
  }, [currentSettings]);

  const holidayColumns = [
    { name: "ID", cell: (row, index) => index + 1, width: "60px" },
    { name: "TITLE", selector: (row) => row.title || "-" },
    {
      name: "FROM DATE",
      selector: (row) => new Date(row.fromDate).toLocaleDateString() || "-",
    },
    { name: "TO DATE", selector: (row) => new Date(row.toDate).toLocaleDateString() || "-" },
    {
      name: "START DATE",
      selector: (row) => new Date(row.startDate).toLocaleDateString() || "-",
    },
    { name: "STATUS", selector: (row) => (row.status === "active" ? "Active" : "Inactive") },
    {
      name: "CREATED AT",
      selector: (row) => new Date(row.createdAt).toLocaleDateString() || "-",
    },
    {
      name: "ACTION",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleHolidayEditClick(row)}
            className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200 cursor-pointer"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleHolidayDeleteClick(row._id)}
            className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#FF8096",
        color: "#fff",
        fontWeight: "bold",
        padding: "12px 16px",
      },
    },
    cells: {
      style: { padding: "8px 12px" },
    },
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Time Slot Management</h1>

      {/* Current Settings Display */}
      <div className="bg-white rounded-xl shadow m-4 p-6 space-y-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Delivery Settings</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-lg font-semibold">{currentSettings.status}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Delivery Starts From</h3>
            <p className="text-lg font-semibold">{currentSettings.startsFrom}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Allowed Delivery Days</h3>
            <p className="text-lg font-semibold">{currentSettings.allowedDays}</p>
          </div>
        </div>
      </div>

      {/* Regular Time Slots Configuration */}
      <div className="bg-white rounded-xl shadow m-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Configure Delivery Settings</h2>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <p className="col-span-1 text-justify font-medium">
            Enable / Disable Time Slot
          </p>
          <div className="col-span-3 flex items-center">
            <Switch checked={formData.timeSlotStatus} onChange={handleSwitchChange} />
            <span className="ml-2">{formData.timeSlotStatus ? "Enabled" : "Disabled"}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <p className="col-span-1 text-justify font-medium">Delivery Starts From?</p>
          <select
            name="shippingStartFrom"
            value={formData.shippingStartFrom}
            onChange={handleInputChange}
            className="col-span-3 border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[
              "today",
              "tomorrow",
              "third day",
              "fourth day",
              "fifth day",
              "sixth day",
              "seventh day",
            ].map((day) => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <p className="col-span-1 text-justify font-medium">
            How many days you want to allow?
          </p>
          <select
            name="expectedDeliveryDays"
            value={formData.expectedDeliveryDays}
            onChange={handleInputChange}
            className="col-span-3 border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 3, 7, 15, 30].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={handleReset}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 cursor-pointer transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="bg-table text-white cursor-pointer px-4 py-2 rounded hover:bg-secondary transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Holiday Time Slots */}
      <div className="bg-white rounded-xl shadow m-4 p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Holiday Time Slots</h2>
        
        {[
          { label: "Title", type: "text", name: "title" },
          { label: "From Date", type: "date", name: "fromDate" },
          { label: "To Date", type: "date", name: "toDate" },
          { label: "Start Date", type: "date", name: "startDate" },
        ].map(({ label, type, name }) => (
          <div key={name} className="grid grid-cols-4 items-center gap-4">
            <p className="col-span-1 text-justify font-medium">{label}</p>
            <input
              type={type}
              name={name}
              value={holidayFormData[name]}
              onChange={handleHolidayInputChange}
              className="col-span-3 border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}

        <div className="grid grid-cols-4 items-center gap-4">
          <p className="col-span-1 text-justify font-medium">Status</p>
          <select
            name="status"
            value={holidayFormData.status === "active" ? "true" : "false"}
            onChange={handleHolidayInputChange}
            className="col-span-3 border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleHolidayReset}
            className="bg-gray-200 px-4 cursor-pointer py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleAddSlot}
            className="bg-table text-white cursor-pointer px-4 py-2 rounded hover:bg-secondary transition-colors"
          >
            {editingSlotId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* Holiday Time Slots Table */}
      <div className="bg-white rounded-xl shadow m-4 p-6 space-y-4">
        <div className="flex gap-4 justify-end mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <LuRefreshCcw
            className="cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={async () => {
              try {
                const response = await getHolidayTimeSlot();
                const data = Array.isArray(response.data)
                  ? response.data
                  : response.data?.data || [];
                setHolidayTimeSlots(
                  data.map((slot) => ({
                    ...slot,
                    status:
                      slot.status === "true" || slot.status === "active" ? "active" : "inactive",
                  }))
                );
              } catch (error) {
                console.error("Error refreshing holiday time slots:", error);
              }
            }}
          />
        </div>
        <DataTable
          columns={holidayColumns}
          data={filteredHolidaySlots}
          pagination
          fixedHeaderScrollHeight="400px"
          customStyles={customStyles}
          highlightOnHover
          responsive
        />
      </div>
    </div>
  );
};

export default TimeSlots;