const { required } = require("joi");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const webSettingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  //   settingsType: {
  //     type: String,
  //     enum: ["adminSettings", "userSettings", "bannerSettings"],
  //   },
  AdminSettings: {
    type: [
      {
        adminLogo: {
          type: String,
          required: true,
        },
        ColorScheme: {
          primary: {
            type: String,
            required: true,
          },
          secondary: {
            type: String,
            required: true,
          },
          tertiary: {
            type: String,
            required: true,
          },
        },
        fontFamily: {
          type: String,
          required: true,
        },
        fontSize: {
          type: String,
          required: true,
        },
        darkMode: {
          type: Boolean,
          required: true,
        },
        radius: {
          type: String,
          required: true,
        },
      },
    ],
    validate: {
      validator: function (val) {
        if (this.settingsType === "AdminSettings") {
          return Array.isArray(val) && val.length > 0;
        }
        return true;
      },
      message: "settings required",
    },
  },
  UserSettings: {
    type: [
      {
        userLogo: {
          type: String,
          required: true,
        },
        ColorScheme: {
          variant1: {
            type: String,
            required: true,
          },
          variant2: {
            type: String,
            required: true,
          },
          variant3: {
            type: String,
            required: true,
          },
          variant4: {
            type: String,
            required: true,
          },
          icon: {
            type: String,
            required: true,
          },
          button: {
            type: String,
            required: true,
          },
        },
        fontFamily: {
          type: String,
          required: true,
        },
        fontTitle: {
          type: String,
          required: true,
        },
        fontSize: {
          type: String,
          required: true,
        },
      },
    ],
    validate: {
      validator: function (val) {
        if (this.settingsType === "UserSettings") {
          return Array.isArray(val) && val.length > 0;
        }
        return true;
      },
      message: "user settings required",
    },
  },
  BannerSettings: {
    type: [
      {
        bannerImage: {
          type: String,
          required: true,
        },
        bannerPosition: {
          type: String,
          required: true,
        },
        bannerStatus: {
          type: String,
          default: "active",
          enum: ["active", "inactive"],
        },
        bannerTitle: {
          type: String,
          required: true,
        },
        bannerSubtitle: {
          type: String,
          required: true,
        },
        bannerOffer: {
          type: String,
          required: true,
        },
        bannerLink: {
          type: String,
          required: true,
        },
        bannerButton: {
          type: String,
          required: true,
        },
      },
    ],
    validate: {
      validator: function (val) {
        if (this.settingsType === "BannerSettings") {
          return Array.isArray(val) && val.length > 0;
        }
        return true;
      },
      message: "Banner settings required",
    },
  },
});

const webSettingsModel = mongoose.model("webSettings", webSettingsSchema);

module.exports = {
  webSettingsModel,
};
