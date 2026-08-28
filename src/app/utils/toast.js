// utils/toast.js
import toast from "react-hot-toast";

const defaultOptions = {
  duration: 4000,
  position: "top-center",
  style: {
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    padding: "16px 24px",
    maxWidth: "500px",
  },
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...defaultOptions,
      style: {
        ...defaultOptions.style,
        background: "#047857", // bgvariant-2
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#ffffff",
        secondary: "#047857",
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      ...defaultOptions,
      style: {
        ...defaultOptions.style,
        background: "#000000", // black
        color: "#ffffff",
      },
      iconTheme: {
        primary: "#ffffff",
        secondary: "#000000",
      },
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast(message, {
      ...defaultOptions,
      icon: "⚠️",
      style: {
        ...defaultOptions.style,
        background: "#f59e0b", // amber-500
        color: "#ffffff",
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast(message, {
      ...defaultOptions,
      icon: "ℹ️",
      style: {
        ...defaultOptions.style,
        background: "#3b82f6", // blue-500
        color: "#ffffff",
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...defaultOptions,
      style: {
        ...defaultOptions.style,
        background: "#6b7280", // gray-500
        color: "#ffffff",
      },
      ...options,
    });
  },

  // Promise-based toast (for async operations)
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || "Loading...",
        success: messages.success || "Success!",
        error: messages.error || "Error occurred!",
      },
      {
        loading: {
          style: {
            ...defaultOptions.style,
            background: "#6b7280",
            color: "#ffffff",
          },
        },
        success: {
          style: {
            ...defaultOptions.style,
            background: "#047857",
            color: "#ffffff",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#047857",
          },
        },
        error: {
          style: {
            ...defaultOptions.style,
            background: "#000000",
            color: "#ffffff",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#000000",
          },
        },
        ...options,
      }
    );
  },

  // Custom toast with your own styling
  custom: (message, options = {}) => {
    toast(message, {
      ...defaultOptions,
      ...options,
    });
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};