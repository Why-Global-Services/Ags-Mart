const { webSettingsModel } = require("../../models/webSetting.model");
const { uploadToCloud } = require("../../utils/uploadFileToS3");

const websettings = async (req) => {
  const { settingsType } = req.body;

  const files = req.file;

  let uploadedImages = null;
  if (files) {
    uploadedImages = await uploadToCloud(files, "Websetting");
  }

  const settingsPayload = {
    settingsType,
  };

  // Admin Settings
  if (settingsType === "adminSettings") {
    settingsPayload.AdminSettings = [
      {
        adminLogo: uploadedImages,
        ColorScheme: {
          primary: req.body.ColorScheme?.primary,
          secondary: req.body.ColorScheme?.secondary,
          tertiary: req.body.ColorScheme?.table,
        },
        fontFamily: req.body.fontFamily,
        fontSize: req.body.fontSize,
        darkMode: req.body.darkMode === "true",
        radius: req.body.radius,
      },
    ];
  }

  // User Settings
  if (settingsType === "userSettings") {
    settingsPayload.UserSettings = [
      {
        userLogo: uploadedImages,
        ColorScheme: {
          variant1: req.body.ColorScheme?.variant1,
          variant2: req.body.ColorScheme?.variant2,
          variant3: req.body.ColorScheme?.variant3,
          variant4: req.body.ColorScheme?.variant4,
          icon: req.body.ColorScheme?.icon,
          button: req.body.ColorScheme?.button,
        },
        fontFamily: req.body?.fontFamily,
        fontTitle: req.body?.fontTitle,
        fontSize: req.body?.fontSize,
      },
    ];
  }

  // Banner Settings
  if (settingsType === "bannerSettings") {
    settingsPayload.BannerSettings = [
      {
        bannerImage: uploadedImages,
        bannerPosition: req.body.bannerPosition,
        bannerStatus: req.body.bannerStatus,
        bannerTitle: req.body.bannerTitle,
        bannerSubtitle: req.body.bannerSubtitle,
        bannerOffer: req.body.bannerOffer,
        bannerLink: req.body.bannerLink,
        bannerButton: req.body.bannerButton,
      },
    ];
  }

  const updatedSettings = await webSettingsModel.findOneAndUpdate(
    {},
    settingsPayload,
    { new: true, upsert: true }
  );

  return {
    success: true,
    message: `${settingsType} saved successfully`,
    data: updatedSettings,
  };
};

const getWebSettings = async (req) => {
  const getwebSettings = await webSettingsModel.findOne({});

  return {
    success: true,
    message: "websiting get sucessfully",
    data: getwebSettings,
  };
};

module.exports = {
  websettings,
  getWebSettings,
};
