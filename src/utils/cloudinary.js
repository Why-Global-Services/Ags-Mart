const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dvlcwhcfz",
  api_key: "253446948775562",
  api_secret: "FqMfLs9OL9F2AULLuUSbziCjtGQ",
});

const uploadSingleImage = async (file) => {
  const { buffer, originalname } = file;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products", resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          // console.log("Cloudinary Upload Result:", result);
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};



module.exports = { cloudinary, uploadSingleImage };
