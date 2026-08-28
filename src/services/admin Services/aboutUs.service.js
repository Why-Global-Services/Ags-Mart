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
          } else if (file.fieldname.startsWith("contentSections")) {
            contentImageFiles.push(file);
          }
        });
      }
  
      // Simple way to find content sections
      const contentSections = [];
      let index = 0;
      console.log("length",req.body.contentSections.length+1)
      // Keep checking for content sections until we don't find any more
      while (index < req.body.contentSections.length) {
        const title = req.body.contentSections[index].title
       
        const description = req.body.contentSections[index].description;
        // If neither title nor description exists, we've reached the end
        if (!title && !description) {
          break;
        }
  
        // Check for new image file for this index
        const imageFile = contentImageFiles.find(
          (file) => file.fieldname === `contentSections[${index}][image]`
        );
  
        let imageURL = null;
  
        if (imageFile) {
          // New image uploaded
          imageURL = await uploadToCloud(imageFile, "aboutus");
        } else {
          // Check if there's existing data to preserve image
          const existing = await aboutUs.findOne();
          if (existing && existing.content && existing.content[index] && existing.content[index].contentImage) {
            imageURL = existing.content[index].contentImage;
          }
        }
  
        // Add the content section
        contentSections.push({
          contentTitle: title || null,
          contentDescription: description || null,
          contentImage: imageURL || null,
        });
  
        index++;
      }
  
      // Check if document exists
      const existing = await aboutUs.findOne();
  
      if (!existing) {
        // Create new document
        const bannerImageURL = bannerImageFile
          ? await uploadToCloud(bannerImageFile)
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
          bannerTitle: req.body.bannerTitle || existing.bannerTitle,
          bannerContent: req.body.bannerContent || existing.bannerContent,
          content: contentSections,
        };
  
        // Handle banner image update
        if (bannerImageFile) {
          updateData.bannerImage = await uploadToCloud(bannerImageFile, "bannerImage");
        } else {
          // Keep existing banner image
          updateData.bannerImage = existing.bannerImage;
        }
  
        const updated = await aboutUs.findOneAndUpdate(
          {}, 
          updateData, 
          {
            new: true,
            runValidators: true,
          }
        );
  
        return {
          success: true,
          message: "About us updated successfully",
          data: updated,
        };
      }
  };
  


const getAboutUs = async(req,res)=>{
    const getAboutUs = await aboutUs.findOne()

    if(!getAboutUs){
        throw new ApiError(httpStatus.NOT_FOUND, "No about us found or create one")
    }

    return {success: true, message: "About us fetched successfully", data: getAboutUs}
}


module.exports = {
    aboutUsData,
    getAboutUs
}