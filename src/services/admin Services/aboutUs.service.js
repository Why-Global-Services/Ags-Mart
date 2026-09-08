const httpStatus = require("http-status");
const { aboutUs } = require("../../models/aboutus");
const ApiError = require("../../utils/apiError");
const { uploadToCloud } = require("../../utils/uploadFileToS3");

const aboutUsData = async (req, res) => {
  let bannerImageFile = null;
  const contentImageFiles = [];

  // Separate files from req.files
  if (req.files && req.files.length > 0) {
    req.files.forEach((file) => {
      if (file.fieldname === "bannerImage") {
        bannerImageFile = file;
      } else if (
        file.fieldname.startsWith("contentSections") ||
        file.fieldname.startsWith("content")
      ) {
        contentImageFiles.push(file);
      }
    });
  }

  // Parse raw content sections from req.body across all possible formats (array, object, or bracket notation from multer)
  const existing = await aboutUs.findOne();
  const rawSections = [];

  if (Array.isArray(req.body.contentSections)) {
    req.body.contentSections.forEach((s) => rawSections.push(s));
  } else if (
    req.body.contentSections &&
    typeof req.body.contentSections === "object"
  ) {
    Object.keys(req.body.contentSections)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((k) => rawSections.push(req.body.contentSections[k]));
  } else {
    // Scan req.body keys for contentSections[0][title], contentSections[0][description], etc.
    const sectionMap = {};
    for (const key of Object.keys(req.body || {})) {
      const match = key.match(
        /^(?:contentSections|content)\[(\d+)\](?:\[(\w+)\]|\.(\w+))$/
      );
      if (match) {
        const idx = parseInt(match[1], 10);
        const field = match[2] || match[3];
        if (!sectionMap[idx]) sectionMap[idx] = {};
        sectionMap[idx][field] = req.body[key];
      }
    }
    const indices = Object.keys(sectionMap)
      .map(Number)
      .sort((a, b) => a - b);
    for (const idx of indices) {
      rawSections.push(sectionMap[idx]);
    }
  }

  const contentSections = [];
  for (let index = 0; index < rawSections.length; index++) {
    const sec = rawSections[index] || {};
    const title = sec.title || sec.contentTitle || null;
    const description = sec.description || sec.contentDescription || null;
    const existingImg =
      sec.existingImage || sec.existingImg || sec.contentImage || null;

    // Check for new uploaded file for this index
    const imageFile = contentImageFiles.find(
      (file) =>
        file.fieldname === `contentSections[${index}][image]` ||
        file.fieldname === `contentSections[${index}].image` ||
        file.fieldname === `content[${index}][image]` ||
        file.fieldname === `content[${index}].image` ||
        file.fieldname === `contentSections[${index}][contentImage]`
    );

    let imageURL = null;
    if (imageFile) {
      imageURL = await uploadToCloud(imageFile, "aboutus");
    } else if (existingImg) {
      imageURL = existingImg;
    } else if (
      existing &&
      existing.content &&
      existing.content[index] &&
      existing.content[index].contentImage
    ) {
      imageURL = existing.content[index].contentImage;
    }

    if (title || description || imageURL) {
      contentSections.push({
        contentTitle: title,
        contentDescription: description,
        contentImage: imageURL,
      });
    }
  }

  if (!existing) {
    // Create new document
    const bannerImageURL = bannerImageFile
      ? await uploadToCloud(bannerImageFile, "bannerImage")
      : null;

    const created = await aboutUs.create({
      bannerImage: bannerImageURL,
      bannerTitle: req.body.bannerTitle || null,
      bannerContent: req.body.bannerContent || null,
      content: contentSections,
    });

    return {
      success: true,
      message: "About us created successfully",
      data: created,
    };
  } else {
    // Update existing document
    const updateData = {
      bannerTitle:
        req.body.bannerTitle !== undefined
          ? req.body.bannerTitle
          : existing.bannerTitle,
      bannerContent:
        req.body.bannerContent !== undefined
          ? req.body.bannerContent
          : existing.bannerContent,
      content: contentSections,
    };

    // Handle banner image update
    if (bannerImageFile) {
      updateData.bannerImage = await uploadToCloud(
        bannerImageFile,
        "bannerImage"
      );
    } else if (req.body.existingBannerImage !== undefined) {
      updateData.bannerImage = req.body.existingBannerImage;
    } else {
      updateData.bannerImage = existing.bannerImage;
    }

    const updated = await aboutUs.findOneAndUpdate({}, updateData, {
      new: true,
      runValidators: true,
    });

    return {
      success: true,
      message: "About us updated successfully",
      data: updated,
    };
  }
};

const getAboutUs = async (req, res) => {
  const getAboutUsData = await aboutUs.findOne();

  if (!getAboutUsData) {
    return {
      success: true,
      message: "About us fetched successfully",
      data: null,
    };
  }

  return {
    success: true,
    message: "About us fetched successfully",
    data: getAboutUsData,
  };
};

module.exports = {
  aboutUsData,
  getAboutUs,
};