const express = require("express");
const cors = require("cors");
const httpStatus = require("http-status");
const morgan = require("./src/config/morgan");
const { errorConverter, errorHandler } = require("./src/middlwares/errors");
const bodyParser = require("body-parser");
const session = require("express-session");
const ApiError = require("./src/utils/apiError");
const passport = require("passport");
const { authLimiter } = require("./src/middlwares/rateLimiter");
const routes = require("./src/routers/v1");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport temporarily disabled
// app.use(passport.initialize());
// app.use(passport.session());

app.use(cors());


app.get("/", (req, res) => {
  res.status(200).send({ message: "Povi's Collection Backend..." });
});

app.use("/v1", routes);
app.use("/v1/auth", authLimiter);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
