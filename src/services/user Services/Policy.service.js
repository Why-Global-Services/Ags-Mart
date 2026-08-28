const { webSettingsModel } = require("../../models/webSetting.model");

const getWebSettings = async (req) => {
  const getwebSettings = await webSettingsModel.findOne({});

  return {
    success: true,
    message: "websiting get sucessfully",
    data: getwebSettings,
  };
};

module.exports = {
  getWebSettings,
};
