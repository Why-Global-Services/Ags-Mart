import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import { getWebSettings, saveWebSettings, getBanner, getBannerCreate, getBannerEdit, deleteBanner } from "../../Interceptor/interceptor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { set } from "zod";

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

const WebSettings = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [adminSettings, setAdminSettings] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [bannerSettings, setBannerSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const [webSettingsResponse, bannerResponse] = await Promise.all([
          getWebSettings(),
          getBanner(),
        ]);

        const { data: webData } = webSettingsResponse || {};
        const fetchedAdmin = webData?.AdminSettings?.[0];
        const fetchedUser = webData?.UserSettings?.[0];
        const fetchedBanner = bannerResponse?.getBannerDetails;
        const fetchedCategories = bannerResponse?.category || [];
        const fetchedSubCategories = bannerResponse?.subCategory || [];

        if (fetchedAdmin) {
          setAdminSettings({
            logo: fetchedAdmin.adminLogo || null,
            primaryColor: fetchedAdmin.ColorScheme?.primary || "#4f46e5",
            secondaryColor: fetchedAdmin.ColorScheme?.secondary || "#ec4899",
            tableColor: fetchedAdmin.ColorScheme?.tertiary || "#FF8096",
            fontFamily: fetchedAdmin.fontFamily?.trim() || "Arial, sans-serif",
            darkMode: fetchedAdmin.darkMode || false,
            roundedCorners: fetchedAdmin.radius?.trim() || "medium",
            availableFonts: fetchedAdmin.fontFamily ? [fetchedAdmin.fontFamily.trim()] : ["Arial, sans-serif"],
          });
        }

        if (fetchedUser) {
          setUserSettings({
            logo: fetchedUser.userLogo || null,
            fontFamily: Array.isArray(fetchedUser.fontFamily)
              ? fetchedUser.fontFamily[0]?.trim() || "Arial, sans-serif"
              : fetchedUser.fontFamily?.trim() || "Arial, sans-serif",
            fontTitle: fetchedUser.fontTitle?.trim() || "Arial, sans-serif",
            colorVariants: [
              { id: 1, color: fetchedUser.ColorScheme?.variant1 || "#fa2d37" },
              { id: 2, color: fetchedUser.ColorScheme?.variant2 || "#ffe3e3" },
              { id: 3, color: fetchedUser.ColorScheme?.variant3 || "#faf5ff" },
              { id: 4, color: fetchedUser.ColorScheme?.variant4 || "#fffCfe" },
              { id: 5, color: fetchedUser.ColorScheme?.icon || "#f5339b" },
              { id: 6, color: fetchedUser.ColorScheme?.button || "#f5339b" },
            ],
            availableFonts: Array.isArray(fetchedUser.fontFamily)
              ? fetchedUser.fontFamily
              : [fetchedUser.fontFamily?.trim() || "Arial, sans-serif"],
          });
        }

        if (fetchedBanner) {
          setBannerSettings({
            position: fetchedBanner[0]?.placeForBanner || "Top",
            images: Array.isArray(fetchedBanner)
              ? fetchedBanner.map((banner) => ({
                id: banner._id,
                url: banner.bgImage || "",
                buttonText: banner.buttonText || "",
                link: banner.link || "",
                offer: banner.offer || "",
                placeForBanner: banner.placeForBanner || "Top",
                position: banner.position ?? true,
                subtitle: banner.subtitle || "",
                title: banner.title || "",
                type: banner.type || "promotion",
                status: banner.status || "active",
                createdAt: banner.createdAt || new Date().toISOString(),
                updatedAt: banner.updatedAt || new Date().toISOString(),
                isNew: false,
              }))
              : [],
          });
        }

        setCategories(fetchedCategories);
        setSubCategories(fetchedSubCategories);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to fetch settings. Please try again.");
        toast.error("Failed to fetch settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="p-4 w-full min-h-screen bg-gray-50 font-family">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md">
          <div className="flex space-x-1 border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 sm:px-5 py-2 sm:py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${activeTab === "admin"
                ? "bg-primary text-gray-900 border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Admin Settings
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 sm:px-5 py-2 sm:py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${activeTab === "user"
                ? "bg-primary text-gray-900 border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              User Settings
            </button>
            <button
              onClick={() => setActiveTab("banner")}
              className={`px-4 sm:px-5 py-2 sm:py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${activeTab === "banner"
                ? "bg-primary text-gray-900 border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Banner Settings
            </button>
          </div>

          <div className="px-1 sm:px-2">
            {activeTab === "admin" && adminSettings && (
              <AdminSettingsForm
                settings={adminSettings}
                setSettings={setAdminSettings}
              />
            )}
            {activeTab === "user" && userSettings && (
              <UserSettingsForm
                settings={userSettings}
                setSettings={setUserSettings}
              />
            )}
            {activeTab === "banner" && bannerSettings && (
              <BannerSettingsForm
                settings={bannerSettings}
                setSettings={setBannerSettings}
                categories={categories}
                subCategories={subCategories}
              />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const AdminSettingsForm = ({ settings, setSettings }) => {
  const [logo, setLogo] = useState(settings?.logo || null);
  const [logoFile, setLogoFile] = useState(null);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || "#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState(settings?.secondaryColor || "#ec4899");
  const [tableColor, setTableColor] = useState(settings?.tableColor || "#FF8096");
  const [fontFamily, setFontFamily] = useState(settings?.fontFamily || "Arial, sans-serif");
  const [darkMode, setDarkMode] = useState(settings?.darkMode || false);
  const [roundedCorners, setRoundedCorners] = useState(settings?.roundedCorners || "medium");
  const [availableFonts, setAvailableFonts] = useState(settings?.availableFonts || ["Arial, sans-serif"]);
  const [newFont, setNewFont] = useState("");
  const [initialSettings, setInitialSettings] = useState(null);

  // Predefined list of common font families
  const fontFamilies = [
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Times New Roman, serif",
    "Georgia, serif",
    "Garamond, serif",
    "Courier New, monospace",
    "Brush Script MT, cursive",
    "Copperplate, fantasy",
    "Papyrus, fantasy",
    "Impact, fantasy",
    "Comic Sans MS, cursive",
    "Open Sans, sans-serif",
    "Roboto, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Poppins, sans-serif"
  ];

  useEffect(() => {
    setSettings({
      logo,
      primaryColor,
      secondaryColor,
      tableColor,
      fontFamily,
      darkMode,
      roundedCorners,
      availableFonts,
    });
  }, [
    logo,
    primaryColor,
    secondaryColor,
    tableColor,
    fontFamily,
    darkMode,
    roundedCorners,
    availableFonts,
    setSettings,
  ]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFont = () => {
    if (newFont && !availableFonts.includes(newFont)) {
      setAvailableFonts([...availableFonts, newFont]);
      setFontFamily(newFont);
      setNewFont("");
    }
  };

  useEffect(() => {
  if (settings) {
    setInitialSettings(settings);
  }
}, []);

  const cornerOptions = [
    { value: "none", label: "Sharp" },
    { value: "4px", label: "Small" },
    { value: "8px", label: "Medium" },
    { value: "12px", label: "Large" },
    { value: "16px", label: "Full" },
  ];

 const handleResetDefaults = () => {
  console.log(initialSettings,"this si the data");
  
  if (!initialSettings) return;


  setLogo(initialSettings.logo || null);
  setLogoFile(null);

  setPrimaryColor(initialSettings.primaryColor || "#4f46e5");
  setSecondaryColor(initialSettings.secondaryColor || "#ec4899");
  setTableColor(initialSettings.tableColor || "#FF8096");

  setFontFamily(initialSettings.fontFamily || "Arial, sans-serif");
  setDarkMode(initialSettings.darkMode || false);
  setRoundedCorners(initialSettings.roundedCorners || "medium");

  setAvailableFonts(
    initialSettings.availableFonts || ["Arial, sans-serif"]
  );

  // Update parent also
  setSettings(initialSettings);

  toast.success("Reset to last saved settings");
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("settingsType", "adminSettings");
    if (logoFile) {
      formData.append("Logo", logoFile);
    } else if (logo && !logoFile) {
      try {
        const response = await fetch(logo);
        if (!response.ok) throw new Error("Failed to fetch logo");
        const blob = await response.blob();
        formData.append("Logo", blob, "logo.png");
      } catch (error) {
        console.error("Error fetching current logo:", error);
        toast.error("Failed to include current logo.");
      }
    }
    formData.append("ColorScheme[primary]", primaryColor);
    formData.append("ColorScheme[secondary]", secondaryColor);
    formData.append("ColorScheme[table]", tableColor);
    formData.append("fontFamily", fontFamily);
    formData.append("darkMode", darkMode);
    formData.append("radius", roundedCorners);

    try {
      const response = await saveWebSettings(formData);
      toast.success("Admin settings saved successfully!");
    } catch (error) {
      console.error("Error saving admin settings:", error);
      toast.error("Failed to save admin settings.");
    }
  };

  return (
    <form className="space-y-6 sm:space-y-8 font-family" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 font-family">
          Admin UI
        </h2>
        <p className="text-sm text-gray-500">
          Customize the admin dashboard appearance and behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4 sm:space-y-5">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Branding
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Upload
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400 text-xs text-center">
                      Logo Preview
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                    {logo ? "Change Logo" : "Upload Logo"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 160x160px, PNG format
                </p>
              </div>
            </div>
          </div>

          {/* <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Typography
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font.split(',')[0] }}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select from common web-safe font families
              </p>
            </div>
          </div> */}
        </div>

        <div className="space-y-4 sm:space-y-5">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Color Scheme
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-md cursor-pointer border border-gray-300 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    setShowPrimaryPicker(!showPrimaryPicker);
                    setShowSecondaryPicker(false);
                    setShowTablePicker(false);
                  }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {showPrimaryPicker && (
                <div className="absolute z-10 mt-2">
                  <SketchPicker
                    color={primaryColor}
                    onChangeComplete={(color) => setPrimaryColor(color.hex)}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-md cursor-pointer border border-gray-300 shadow-sm"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={() => {
                    setShowSecondaryPicker(!showSecondaryPicker);
                    setShowPrimaryPicker(false);
                    setShowTablePicker(false);
                  }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {showSecondaryPicker && (
                <div className="absolute z-10 mt-2">
                  <SketchPicker
                    color={secondaryColor}
                    onChangeComplete={(color) => setSecondaryColor(color.hex)}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-md cursor-pointer border border-gray-300 shadow-sm"
                  style={{ backgroundColor: tableColor }}
                  onClick={() => {
                    setShowTablePicker(!showTablePicker);
                    setShowPrimaryPicker(false);
                    setShowSecondaryPicker(false);
                  }}
                />
                <input
                  type="text"
                  value={tableColor}
                  onChange={(e) => setTableColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {showTablePicker && (
                <div className="absolute z-10 mt-2">
                  <SketchPicker
                    color={tableColor}
                    onChangeComplete={(color) => setTableColor(color.hex)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          type="button"
          onClick={()=> handleResetDefaults()}
          className="px-4 py-2 border cursor-pointer  border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          type="submit"
          className="px-6 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-table hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

const UserSettingsForm = ({ settings, setSettings }) => {
  const [logo, setLogo] = useState(settings?.logo || null);
  const [logoFile, setLogoFile] = useState(null);
  const [fontFamily, setFontFamily] = useState(settings?.fontFamily || "Arial, sans-serif");
  const [fontTitle, setFontTitle] = useState(settings?.fontTitle || "Arial, sans-serif");
  const [colorVariants, setColorVariants] = useState(
    settings?.colorVariants || [
      { id: 1, color: "#fa2d37" },
      { id: 2, color: "#ffe3e3" },
      { id: 3, color: "#faf5ff" },
      { id: 4, color: "#fffCfe" },
      // { id: 5, color: "#f5339b" },
      // { id: 6, color: "#f5339b" },
    ]
  );
  const [showPickerForVariant, setShowPickerForVariant] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);

  // Predefined list of common font families
  const fontFamilies = [
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "Trebuchet MS, sans-serif",
    "Times New Roman, serif",
    "Georgia, serif",
    "Garamond, serif",
    "Courier New, monospace",
    "Brush Script MT, cursive",
    "Copperplate, fantasy",
    "Papyrus, fantasy",
    "Impact, fantasy",
    "Comic Sans MS, cursive",
    "Open Sans, sans-serif",
    "Roboto, sans-serif",
    "Lato, sans-serif",
    "Montserrat, sans-serif",
    "Poppins, sans-serif"
  ];

  useEffect(() => {
    setSettings({
      logo,
      fontFamily,
      fontTitle,
      colorVariants
    });
  }, [logo, fontFamily, fontTitle, colorVariants, setSettings]);

  useEffect(() =>{
    if (settings) {
      setInitialSettings(settings);
    }
  },[])

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefaults = () => {
    if (!initialSettings) return;

    setLogo(initialSettings.logo || null);
    setLogoFile(null);

    toast.success("Reset to last saved settings");
  }

  const updateColorVariant = (id, value) => {
    setColorVariants(
      colorVariants.map((variant) =>
        variant.id === id ? { ...variant, color: value } : variant
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("settingsType", "userSettings");
    if (logoFile) {
      formData.append("Logo", logoFile);
    } else if (logo && !logoFile) {
      try {
        const response = await fetch(logo);
        if (!response.ok) throw new Error("Failed to fetch logo");
        const blob = await response.blob();
        formData.append("Logo", blob, "logo.png");
      } catch (error) {
        console.error("Error fetching current logo:", error);
        toast.error("Failed to include current logo.");
      }
    }
    formData.append("fontFamily", fontFamily);
    formData.append("fontTitle", fontTitle);
    formData.append("ColorScheme[variant1]", colorVariants[0]?.color || "#fa2d37");
    formData.append("ColorScheme[variant2]", colorVariants[1]?.color || "#ffe3e3");
    formData.append("ColorScheme[variant3]", colorVariants[2]?.color || "#faf5ff");
    formData.append("ColorScheme[variant4]", colorVariants[3]?.color || "#fffCfe");
    // formData.append("ColorScheme[icon]", colorVariants[4]?.color || "#f5339b");
    // formData.append("ColorScheme[button]", colorVariants[5]?.color || "#f5339b");

    try {
      const response = await saveWebSettings(formData);
      toast.success("User settings saved successfully!");
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast.error("Failed to save user settings.");
    }
  };

  return (
    <ErrorBoundary>
      <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            User UI
          </h2>
          <p className="text-sm text-gray-500">
            Customize your dashboard appearance and behavior
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Branding
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Upload
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-16 w-16 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-gray-400 text-xs text-center">
                        Logo Preview
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                      {logo ? "Change Logo" : "Upload Logo"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                  <p className="mt-3 text-xs text-gray-500">
                    Recommended size: 160x160px, PNG format
                  </p>
                </div>
              </div>
            </div>
            {/* <div className="space-y-4 sm:space-y-5">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Typography
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Content
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font.split(',')[0] }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select font for content text
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Title
                </label>
                <select
                  value={fontTitle}
                  onChange={(e) => setFontTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font.split(',')[0] }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select font for headings and titles
                </p>
              </div>
            </div> */}
          </div>

          {/* <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Color Scheme
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Variants
              </label>
              <div className="grid grid-cols-1 gap-3">
                {colorVariants.map((variant) => (
                  variant.id !== 5 && variant.id !== 6 && (  // <-- FULL BLOCK hide
                    <div key={variant.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Variant {variant.id}
                      </label>

                      <div className="relative">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-md cursor-pointer border border-gray-300 shadow-sm"
                            style={{ backgroundColor: variant.color }}
                            onClick={() =>
                              setShowPickerForVariant(
                                showPickerForVariant === variant.id ? null : variant.id
                              )
                            }
                          />

                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) =>
                              updateColorVariant(variant.id, e.target.value)
                            }
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter color hex code"
                          />
                        </div>

                        {showPickerForVariant === variant.id && (
                          <div className="absolute z-10 mt-2">
                            <SketchPicker
                              color={variant.color}
                              onChangeComplete={(color) =>
                                updateColorVariant(variant.id, color.hex)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>

            </div>
          </div> */}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={()=> {
              handleResetDefaults()
            }}
            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            type="submit"
            className="px-6 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-table hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </ErrorBoundary>
  );
};

const BannerSettingsForm = ({ settings, setSettings, categories, subCategories }) => {
  const [banners, setBanners] = useState(settings?.images || []);
  const [newBanner, setNewBanner] = useState({
    bgImage: null,
    bgImageFile: null,
    offer: "",
    buttonText: "Shop Now",
    link: "",
    placeForBanner: settings?.position || "Top",
    position: true,
    status: "active",
  });
  const [editBanner, setEditBanner] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (settings?.images) {
      setBanners(settings.images);
    }
  }, [settings]);

  useEffect(() => {
    setSettings({ images: banners, position: newBanner.placeForBanner });
  }, [banners, newBanner.placeForBanner, setSettings]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBanner((prev) => ({
          ...prev,
          bgImage: reader.result,
          bgImageFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBanner((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addNewBanner = async () => {
    if (!newBanner.bgImageFile) {
      toast.error("Please upload a banner image");
      return;
    }
    // if (!newBanner.offer) {
    //   toast.error("Please provide an offer");
    //   return;
    // }
    // if (!newBanner.buttonText) {
    //   toast.error("Please provide button text");
    //   return;
    // }
    if (!newBanner.link) {
      toast.error("Please select a link");
      return;
    }

    const formData = new FormData();
    formData.append("bgImage", newBanner.bgImageFile);
    formData.append("offer", newBanner.offer);
    formData.append("buttonText", newBanner.buttonText);
    formData.append("link", newBanner.link);
    formData.append("placeForBanner", newBanner.placeForBanner);
    formData.append("position", newBanner.position);
    formData.append("status", newBanner.status);

    try {
      const response = await getBannerCreate(formData);
      const newBannerData = response.bannerDetails;
      setBanners((prev) => [
        ...prev,
        {
          id: newBannerData._id,
          url: newBannerData.bgImage,
          offer: newBannerData.offer,
          buttonText: newBannerData.buttonText,
          link: newBannerData.link,
          placeForBanner: newBannerData.placeForBanner,
          position: newBannerData.position,
          status: newBannerData.status,
          createdAt: newBannerData.createdAt,
          updatedAt: newBannerData.updatedAt,
          isNew: false,
        },
      ]);
      toast.success("Banner added successfully!");
      setNewBanner({
        bgImage: null,
        bgImageFile: null,
        offer: "",
        buttonText: "Shop Now",
        link: "",
        placeForBanner: settings?.position || "Top",
        position: true,
        status: "active",
      });
    } catch (error) {
      console.error("Error adding banner:", error);
      toast.error(error.message || "Failed to add banner.");
    }
  };

  const removeBanner = async (id) => {
    try {
      const response = await deleteBanner(id)

      setBanners((prev) => prev.filter((banner) => banner.id !== id));
      toast.success("Banner removed successfully!");
    } catch (error) {
      console.error("This is the error: ", error)
    }

  };

  const handleToggleActive = async (id, currentStatus) => {
    const updatedBanners = banners.map((banner) =>
      banner.id === id ? { ...banner, position: !currentStatus, status: !currentStatus ? "active" : "inactive" } : banner
    );
    setBanners(updatedBanners);

    const formData = new FormData();
    formData.append("position", !currentStatus);
    formData.append("status", !currentStatus ? "active" : "inactive");

    try {
      await getBannerEdit(id, formData);
      toast.success("Banner status updated successfully!");
    } catch (error) {
      console.error("Error updating banner status:", error);
      toast.error("Failed to update banner status.");
      setBanners(banners); // Revert on error
    }
  };

  const openEditModal = (banner) => {
    setEditBanner(banner);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBanner((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditBanner((prev) => ({
          ...prev,
          url: reader.result,
          file,
          isNew: true,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // if (!editBanner.offer) {
    //   toast.error("Please provide an offer");
    //   return;
    // }
    // if (!editBanner.buttonText) {
    //   toast.error("Please provide button text");
    //   return;
    // }
    if (!editBanner.link) {
      toast.error("Please select a link");
      return;
    }

    const formData = new FormData();
    if (editBanner.file) {
      formData.append("bgImage", editBanner.file);
    }
    formData.append("offer", editBanner.offer);
    formData.append("buttonText", editBanner.buttonText);
    formData.append("link", editBanner.link);
    formData.append("placeForBanner", editBanner.placeForBanner);
    formData.append("position", editBanner.position);
    formData.append("status", editBanner.status);

    try {
      const response = await getBannerEdit(editBanner.id, formData);
      const updatedBanner = response.editBannerDetails;
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === editBanner.id
            ? {
              ...editBanner,
              id: updatedBanner._id,
              url: updatedBanner.bgImage,
              offer: updatedBanner.offer,
              buttonText: updatedBanner.buttonText,
              link: updatedBanner.link,
              placeForBanner: updatedBanner.placeForBanner,
              position: updatedBanner.position,
              status: updatedBanner.status,
              createdAt: updatedBanner.createdAt,
              updatedAt: updatedBanner.updatedAt,
              isNew: false,
            }
            : banner
        )
      );
      toast.success("Banner updated successfully!");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error editing banner:", error);
      toast.error(error.message || "Failed to update banner.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success("Banner settings saved successfully!");
  };

  const bannerPositions = [
    { value: "Top", label: "Top Banner" },
    { value: "Middle", label: "Middle Banner" },
    { value: "Bottom", label: "Bottom Banner" },
  ];

  // Updated linkOptions to match the desired format
  const linkOptions = [
    { value: `/shoppage/?type=discount`, label: "Offer" },
    ...categories.map((cat) => ({
      value: `/shoppage/?query=${cat._id}&type=category`,
      label: `Category: ${cat.categoryTitle}`,
    })),
    ...subCategories.map((subCat) => ({
      value: `/shoppage/?query=${subCat._id}&type=subcategory`,
      label: `Subcategory: ${subCat.subCategoryTitle}`,
    })),
  ];

  return (
    <ErrorBoundary>
      <div>
        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Banner UI
            </h2>
            <p className="text-sm text-gray-600">
              Manage your website banners and their content
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Banner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {newBanner.bgImage ? (
                        <img
                          src={newBanner.bgImage}
                          alt="Banner Preview"
                          className="h-32 w-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-32 w-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <span className="text-gray-400 text-sm text-center">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          {newBanner.bgImage ? "Change Image" : "Upload Image"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended: 1200x300px, JPG/PNG
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Position
                  </label>
                  <select
                    name="placeForBanner"
                    value={newBanner.placeForBanner}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {bannerPositions.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="position"
                    id="position"
                    checked={newBanner.position}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="position"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Text
                  </label>
                  <input
                    type="text"
                    name="offer"
                    value={newBanner.offer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Offer details"
                  />
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={newBanner.buttonText}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Shop Now"
                    />
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link
                    </label>
                    <select
                      name="link"
                      value={newBanner.link}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select a link
                      </option>
                      {linkOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={addNewBanner}
                className="px-6 py-2  font-medium text-white bg-table rounded-sm cursor-pointer   hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                Add Banner
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Banners
            </h3>
            {banners.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">No banners added yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse divide-y divide-gray-200">
                 
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banners.map((banner) => (
                      <tr key={banner.id}>
                        <td className="px-4 py-2">
                          <img
                            src={banner.url}
                            alt="Banner"
                            className="h-16 object-cover rounded"
                          />
                        </td>
                        {/* <td className="px-2 py-2 text-sm text-gray-900 truncate">
                          {banner.offer || "N/A"}
                        </td> */}
                        {/* <td className="px-2 py-2 text-sm text-gray-900 truncate">
                          {banner.buttonText || "N/A"}
                        </td> */}
                        <td className="px-2 py-2 text-sm text-gray-900 truncate">
                          {banner.link || "N/A"}
                        </td>
                        {/* <td className="px-2 py-2 text-sm text-gray-900">
                          {banner.placeForBanner || "Top"}
                        </td> */}
                        <td className="px-2 py-2 text-sm">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={banner.position}
                              onChange={() => handleToggleActive(banner.id, banner.position)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-900 capitalize">
                              {banner.status}
                            </span>
                          </label>
                        </td>
                        {/* <td className="px-2 py-2 text-sm text-gray-900 hidden md:table-cell">
                          {new Date(banner.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 hidden md:table-cell">
                          {new Date(banner.updatedAt).toLocaleDateString()}
                        </td> */}
                        <td className="px-2 py-2 text-sm space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(banner)}
                            className="text-blue-600 cursor-pointer hover:text-blue-500 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBanner(banner.id)}
                            className="text-red-600 cursor-pointer hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-table rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>

        {editModalOpen && editBanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Banner</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={editBanner.url}
                      alt="Banner Preview"
                      className="h-24 object-cover rounded-lg"
                    />
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100">
                        Change Image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditImageChange}
                      />
                    </label>
                  </div>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer
                  </label>
                  <input
                    type="text"
                    name="offer"
                    value={editBanner.offer || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={editBanner.buttonText || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link
                  </label>
                  <select
                    name="link"
                    value={editBanner.link || ""}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select a link
                    </option>
                    {linkOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    name="placeForBanner"
                    value={editBanner.placeForBanner || "Top"}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {bannerPositions.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default WebSettings;