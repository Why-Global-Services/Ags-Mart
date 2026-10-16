const mongoose = require("mongoose");
const httpStatus = require("http-status");
const logger = require("../config/logger");
const ApiError = require("../utils/apiError");

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const isMongoError =
      error instanceof mongoose.Error ||
      error.code === 11000 ||
      error.name === "MongoServerError" ||
      error.name === "ValidationError";

    const statusCode =
      error.statusCode ||
      (isMongoError ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);

    let message = error.message || httpStatus[statusCode];

    if (error.code === 11000) {
      const keys = Object.keys(error.keyValue || {}).join(", ");
      message = `${keys ? keys.charAt(0).toUpperCase() + keys.slice(1) : "Record"} already exists`;
    }

    const isOperational = Boolean(error.isOperational || isMongoError || error.statusCode);
    error = new ApiError(statusCode, message, isOperational, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (!err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...{ stack: err.stack },
  };

  logger.error(err);

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
