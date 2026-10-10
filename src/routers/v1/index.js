const express = require("express");
const router = express.Router();
const UserRoute = require("./user.route");
const AdminRoute = require("./admin.route");
const ShippingRoute = require("./shipping.route");

const Routes = [
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/admin",
    route: AdminRoute,
  },
  {
    path: "/shipping",
    route: ShippingRoute,
  },
];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
