const ApiError = require("./apiError");
const httpStatus = require("http-status");
const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  endpoint: process.env.AWS_ENDPOINT,
  credentials: new AWS.Credentials(
    String(process.env.AWS_ACCESS_KEY_ID),
    String(process.env.AWS_SECRET_ACCESS_KEY)
  ),
});

const uploadToCloud = async (file, keyPrefix = "products") => {
  try {
    if (!file) throw new ApiError(httpStatus.BAD_REQUEST, "File not found");

    const safeFileName = file.originalname.replace(/\s+/g, "_");
    const key = `${keyPrefix}/AGROWMED_${Date.now()}_${safeFileName}`;

    const params = {
      Bucket: "facesync",
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    console.log("🚀 Uploading to DigitalOcean:", key);

    const uploadedData = await s3.upload(params).promise();

    const fileUrl = uploadedData.Location.startsWith("https://")
      ? uploadedData.Location
      : `https://${uploadedData.Location}`;

    console.log("✅ Uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Upload failed, please try again"
    );
  }
};

const deleteFolderFromS3 = async (folderName, bucketName = "facesync") => {
  const params = {
    Bucket: bucketName,
    Prefix: folderName,
  };

  const listAllObjects = async (params) => {
    let data;
    do {
      data = await s3.listObjectsV2(params).promise();
      if (data.Contents.length === 0) break;

      const deleteParams = {
        Bucket: bucketName,
        Delete: { Objects: [] },
      };

      data.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });

      await s3.deleteObjects(deleteParams).promise();

      params.ContinuationToken = data.NextContinuationToken;
    } while (data.IsTruncated);
  };

  await listAllObjects(params);
};

const deleteFileFromS3 = async (fileUrl, bucketName = "facesync") => {
  const params = {
    Bucket: bucketName,
    Key: fileUrl,
  };

  await s3.deleteObject(params).promise();
};

const calculateFolderSize = async (folderName) => {
  let totalSize = 0;
  const bucketName = "facesync";
  const params = {
    Bucket: bucketName,
    Prefix: folderName,
  };

  const listAllObjects = async (params) => {
    let data;
    do {
      data = await s3.listObjectsV2(params).promise();
      data.Contents.forEach((obj) => {
        totalSize += obj.Size;
      });
      params.ContinuationToken = data.NextContinuationToken;
    } while (data.IsTruncated);
  };

  await listAllObjects(params);
  return totalSize;
};

const convertSize = (sizeInBytes) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return {
    size: parseFloat(size.toFixed(2)),
    unit: units[unitIndex],
  };
};

module.exports = {
  s3,
  uploadToCloud,
  calculateFolderSize,
  convertSize,
  deleteFolderFromS3,
  deleteFileFromS3,
};
