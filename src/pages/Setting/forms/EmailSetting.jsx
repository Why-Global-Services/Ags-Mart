import React, { useState, useEffect } from 'react';
import { getEmailSettings, postEmailSettings } from '../../Setting/emailSettingservices';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialFormState = {
  email: '',
  password: '',
  smtpHost: '',
  smtpPort: '',
  emailContentType: '',
  smtpEncryption: '',
};

const EmailSetting = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        setIsLoading(true);
        const response = await getEmailSettings();
        if (response && Object.keys(response).length > 0) {
          setFormData({ ...initialFormState, ...response });
        } else {
          setFormData(initialFormState);
        }
      } catch (error) {
        console.error('Failed to fetch email settings:', error);
        setFormData(initialFormState);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailSettings();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (!formData.smtpHost) {
      newErrors.smtpHost = 'SMTP Host is required';
    }
    if (!formData.smtpPort || isNaN(formData.smtpPort)) {
      newErrors.smtpPort = 'Valid SMTP Port is required';
    }
    if (!formData.emailContentType) {
      newErrors.emailContentType = 'Email Content Type is required';
    }
    if (!formData.smtpEncryption) {
      newErrors.smtpEncryption = 'SMTP Encryption is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await postEmailSettings(formData);

      if (response) {
        toast.success('Email settings saved successfully!');
        const refreshResponse = await getEmailSettings();
        if (refreshResponse) {
          setFormData(refreshResponse);
        } else {
          toast.error('Failed to load updated settings.');
        }
      } else {
        toast.error('Failed to save email settings.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An error occurred while saving settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await getEmailSettings();
      setFormData({ ...initialFormState, ...response });
      toast.info('Form reset to saved values.');
    } catch {
      setFormData(initialFormState);
      toast.info('Form reset to default values.');
    }
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <p>Loading email settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Email SMTP Settings</h2>
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
        <p className="text-gray-600 text-sm sm:text-base">
          Email SMTP settings, notifications and others related to email.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* SMTP Host */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="smtpHost"
              value={formData.smtpHost}
              onChange={handleChange}
              className={`w-full border ${errors.smtpHost ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            />
            {errors.smtpHost && <p className="text-sm text-red-500 mt-1">{errors.smtpHost}</p>}
          </div>

          {/* SMTP Port */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="smtpPort"
              value={formData.smtpPort}
              onChange={handleChange}
              className={`w-full border ${errors.smtpPort ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            />
            {errors.smtpPort && <p className="text-sm text-red-500 mt-1">{errors.smtpPort}</p>}
          </div>

          {/* Email Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Content Type <span className="text-red-500">*</span>
            </label>
            <select
              name="emailContentType"
              value={formData.emailContentType}
              onChange={handleChange}
              className={`w-full border ${errors.emailContentType ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            >
              <option value="">Select Content Type</option>
              <option value="text/plain">Text/Plain</option>
              <option value="text/html">HTML</option>
            </select>
            {errors.emailContentType && <p className="text-sm text-red-500 mt-1">{errors.emailContentType}</p>}
          </div>

          {/* SMTP Encryption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Encryption <span className="text-red-500">*</span>
            </label>
            <select
              name="smtpEncryption"
              value={formData.smtpEncryption}
              onChange={handleChange}
              className={`w-full border ${errors.smtpEncryption ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            >
              <option value="">Select Encryption</option>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
            {errors.smtpEncryption && <p className="text-sm text-red-500 mt-1">{errors.smtpEncryption}</p>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 px-4 py-2 disabled:opacity-50 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-table text-white cursor-pointer  rounded-lg hover:bg-secondary px-4 py-2 disabled:opacity-50 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailSetting;
