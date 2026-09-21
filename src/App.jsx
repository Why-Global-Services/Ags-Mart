import { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Sidebar from "./common/Sidebar";
import Navbar from "./common/Navbar";
import ProtectedRoute from "./common/ProtectedRoute";
import Login from "./common/Login";
import { useAuth, isTokenValid } from "./common/authContext";
import NotFoundPage from "./common/notFound";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorBoundary from "./common/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import SystemTable from "./pages/System User/systemTable";
import UserQueries from "./pages/UserQueries/UserQueries";
import AdminTopbarMessages from "./pages/TopBar/AdminTopbarMessages";
import TestimonialMain from "./pages/Testimonial/TestimonialMain";

// Lazy load all components
const Dmain = lazy(() => import("./pages/DashBoard/Dmain"));
const SystemUser = lazy(() => import("./pages/System User/index"));
const SystemForm = lazy(() =>
  import("./pages/System User/index").then((module) => ({
    default: module.SystemForm,
  }))
);
const ProductMain = lazy(() => import("./pages/Product/ProductMain"));
const CreateProduct = lazy(() => import("./pages/Product/CreateProduct"));
const CategoriesMain = lazy(() => import("./pages/Categories/CategoriesMain"));
const CategoriesForm = lazy(() => import("./pages/Categories/CategoriesFrom"));
const SubCategoriesMain = lazy(() =>
  import("./pages/SubCategories/SubCategoriesMain")
);
const SubCategoriesForm = lazy(() =>
  import("./pages/SubCategories/SubCategoriesFrom")
);
const OrderMain = lazy(() => import("./pages/Orders/OrderMain"));
const CustomersMain = lazy(() => import("./pages/Customers/CustomersMain"));
const ReviewMain = lazy(() => import("./pages/Reviews/ReviewMain"));
const OfferMain = lazy(() => import("./pages/Offers/OfferMain"));
const OfferForm = lazy(() => import("./pages/Offers/OfferForm"));
const OfferDetails = lazy(() => import("./pages/Offers/OfferDetails"));
const AssignProducts = lazy(() => import("./pages/Offers/AssignProducts"));
const BrandsMain = lazy(() => import("./pages/Brand/BrandMain"));
const BrandsForm = lazy(() => import("./pages/Brand/BrandForm"));
const CouponMain = lazy(() => import("./pages/Coupon/CouponMain"));
const CouponForm = lazy(() => import("./pages/Coupon/CouponForm"));
const Profilemain = lazy(() => import("./pages/profile/profilemain"));
const Websettingmain = lazy(() => import("./pages/WebSetting/Websettingmain"));
const ReportMain = lazy(() => import("./pages/Reports/ReportsMain"));
const Featuredproductsmain = lazy(() =>
  import("./pages/featuredproductas/featuredproductsmain")
);
const Featuredaddproducts = lazy(() =>
  import("./pages/featuredproductas/featuredaddproducts")
);
const NotificationMain = lazy(() =>
  import("./pages/Notification/NotificationMain")
);
const NotificationForm = lazy(() =>
  import("./pages/Notification/NotificationForm")
);
const FeaturedDetails = lazy(() =>
  import("./pages/featuredproductas/FeaturedDetails")
);
const FeaturedAssignProducts = lazy(() =>
  import("./pages/featuredproductas/AssignProducts")
);
const SettingLayout = lazy(() =>
  import("./pages/Setting/layout/SettingLayout")
);
const StoreSetting = lazy(() => import("./pages/Setting/forms/StoreSetting"));
const EmailSetting = lazy(() => import("./pages/Setting/forms/EmailSetting"));
const PaymentLayout = lazy(() =>
  import("./pages/Setting/forms/Payment Method/layout/PaymentLayout")
);
const Razorpay = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/Razorpay")
);
const Stripe = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/Stripe")
);
const PayPal = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/PayPal")
);
const Instamojo = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/Instamojo")
);
const GooglePay = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/GooglePay")
);
const CashOnDelivery = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/CashOnDelivery")
);
const BankTransfer = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/BankTransfer")
);
const ShippingMethods = lazy(() =>
  import("./pages/Setting/forms/ShippingMethods")
);
const TimeSlots = lazy(() => import("./pages/Setting/forms/TimeSlots"));
const ContactUs = lazy(() => import("./pages/Setting/forms/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/Setting/forms/PrivacyPolicy"));
const TermsAndCondition = lazy(() =>
  import("./pages/Setting/forms/TermsAndCondition")
);
const ModuleManager = lazy(() =>
  import("./pages/Setting/forms/ModuleManaager")
);
const ShippingPolicy = lazy(() =>
  import("./pages/Setting/forms/ShippingPolicy")
);
const AdminPolicy = lazy(() => import("./pages/Setting/forms/AdminPolicy"));
const DeliveryPolicy = lazy(() =>
  import("./pages/Setting/forms/DeliveryPolicy")
);
const SystemRegisteration = lazy(() =>
  import("./pages/Setting/forms/SystemRegisteration")
);
const PhonePay = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/PhonePay")
);
const Paytm = lazy(() =>
  import("./pages/Setting/forms/Payment Method/Pages/Paytm")
);
const AboutUs = lazy(() => import("./pages/Setting/forms/AboutUs"));
const ReturnPoilicy = lazy(() => import("./pages/Setting/forms/ReturnPoilicy"));
const SampleForm = lazy(() => import("./pages/SampleForm/sampleForm"));
// const TestimonialMain = lazy(() => import("./pages/Testimonial/TestimonialMain"));
const TestimonialForm = lazy(() => import("./pages/Testimonial/TestimonialForm"));
// const TopBar = lazy(() => import("./pages/TopBar/AdminTopbarMessages"));
// const Faq = lazy(() => import("./pages/Setting/forms/Faq"));

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, token } = useAuth();
  const storedToken = localStorage.getItem("Token");
  const isAuth = isAuthenticated() && isTokenValid(storedToken);

  // Synchronize route with authentication status
  useEffect(() => {
    const rawToken = localStorage.getItem("Token");
    const valid = isAuthenticated() && isTokenValid(rawToken);
    const isPublic = location.pathname === "/" || location.pathname === "/login";

    if (!valid && !isPublic) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Handle browser Back/Forward (popstate) and cache restoration (pageshow)
  useEffect(() => {
    const handleBrowserNav = () => {
      const rawToken = localStorage.getItem("Token");
      const valid = isTokenValid(rawToken);
      const pathname = window.location.pathname;
      const isPublic = pathname === "/" || pathname === "/login";

      if (!valid && !isPublic) {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("popstate", handleBrowserNav);
    window.addEventListener("pageshow", handleBrowserNav);

    return () => {
      window.removeEventListener("popstate", handleBrowserNav);
      window.removeEventListener("pageshow", handleBrowserNav);
    };
  }, [navigate]);

  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    !isAuth;

  return (
    <div className="flex h-screen overflow-y-hidden">
      {!isLoginPage && <Sidebar isCollapsed={isCollapsed} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isLoginPage && <Navbar toggleSidebar={toggleSidebar} />}
        <main className="flex-1 overflow-y-auto p-0 mt-0">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route
                  path="/"
                  element={
                    isAuth ? <Navigate to="/products" replace /> : <Login />
                  }
                />
                <Route element={<ProtectedRoute key={token || "unauthenticated"} />}>
                  <Route path="/testimonial" element={<TestimonialMain />} />
                  <Route path="/testimonial/add" element={<TestimonialForm />} />
                  <Route
                    path="/testimonial/edit/:id"
                    element={<TestimonialForm />}
                  />
                  <Route path="/productForm" element={<SampleForm />} />
                  {/* Main routes */}
                  <Route path="/dashboard" element={<Dmain />} />
                  <Route path="/products" element={<ProductMain />} />
                  <Route path="/products/add" element={<CreateProduct />} />
                  <Route
                    path="/products/edit/:id"
                    element={<CreateProduct />}
                  />
                  <Route path="/categories" element={<CategoriesMain />} />
                  <Route
                    path="/categories/edit/:id"
                    element={<CategoriesForm />}
                  />
                  <Route path="/categories/add" element={<CategoriesForm />} />
                  <Route
                    path="/subcategories"
                    element={<SubCategoriesMain />}
                  />
                  <Route
                    path="/subcategories/edit/:id"
                    element={<SubCategoriesForm />}
                  />
                  <Route
                    path="/subcategories/add"
                    element={<SubCategoriesForm />}
                  />
                  <Route path="/coupons" element={<CouponMain />} />
                  <Route path="/coupons/add" element={<CouponForm />} />
                  <Route
                    path="/coupons/edit/:id"
                    element={<CouponForm isEdit={true} />}
                  />
                  <Route path="/orders" element={<OrderMain />} />
                  <Route path="/customers" element={<CustomersMain />} />
                  <Route path="/reviews" element={<ReviewMain />} />
                  <Route path="/offers" element={<OfferMain />} />
                  <Route path="/offers/create" element={<OfferForm />} />
                  <Route path="/offers/:id" element={<OfferForm />} />
                  <Route
                    path="/offers/offerDetails/:id"
                    element={<OfferDetails />}
                  />
                  <Route
                    path="/offers/offerDetails/:id/assignProducts"
                    element={<AssignProducts />}
                  />
                  <Route
                    path="/offers/offerDetails/:id/:offerProductid"
                    element={<AssignProducts />}
                  />
                  <Route path="/report" element={<ReportMain />} />
                  
                  <Route path="/brand" element={<BrandsMain />} />
                  <Route path="/brand/edit/:id" element={<BrandsForm />} />
                  <Route path="/brand/add" element={<BrandsForm />} />
                  <Route path="/profile" element={<Profilemain />} />
                  <Route path="/websetting" element={<Websettingmain />} />
                  <Route path="/userqueries" element={<UserQueries />} />
                  <Route path="/topbar" element={<AdminTopbarMessages />} />
                  

                  {/* Settings nested routes */}
                  <Route path="/setting" element={<SettingLayout />}>
                    <Route index element={<StoreSetting />} />
                    <Route path="storesetting" element={<StoreSetting />} />
                    <Route path="emailsetting" element={<EmailSetting />} />
                    {/* Payment methods nested routes */}
                    <Route path="paymethods" element={<PaymentLayout />}>
                      <Route index element={<Razorpay />} />
                      <Route path="razorpay" element={<Razorpay />} />
                      <Route path="stripe" element={<Stripe />} />
                      <Route path="phonePay" element={<PhonePay />} />
                      <Route path="paytm" element={<Paytm />} />
                      <Route path="payPal" element={<PayPal />} />
                      <Route path="instamojo" element={<Instamojo />} />
                      <Route path="googlePay" element={<GooglePay />} />
                      <Route path="cod" element={<CashOnDelivery />} />
                      <Route path="BankTransfer" element={<BankTransfer />} />
                    </Route>
                    <Route
                      path="shippingmethods"
                      element={<ShippingMethods />}
                    />
                    <Route path="timeslots" element={<TimeSlots />} />
                    <Route path="contactus" element={<ContactUs />} />
                    <Route path="aboutus" element={<AboutUs />} />
                    <Route path="privacy&policy" element={<PrivacyPolicy />} />
                    <Route
                      path="terms&conditions"
                      element={<TermsAndCondition />}
                    />
                    <Route path="moduleManager" element={<ModuleManager />} />
                    <Route path="returnpolicy" element={<ReturnPoilicy />} />
                    <Route path="shippingpolicy" element={<ShippingPolicy />} />
                    <Route path="adminpolicy" element={<AdminPolicy />} />
                    <Route path="deliverypolicy" element={<DeliveryPolicy />} />
                    <Route
                      path="systemregistration"
                      element={<SystemRegisteration />}
                    />
                    {/* <Route path="faq" element={<Faq />} /> */}
                  </Route>

                  <Route
                    path="/featuredproducts"
                    element={<Featuredproductsmain />}
                  />
                  <Route
                    path="/featuredproducts/featuredDetails/:id"
                    element={<FeaturedDetails />}
                  />
                  <Route
                    path="/featuredproducts/featuredDetails/:id/assignProducts"
                    element={<FeaturedAssignProducts />}
                  />
                  <Route
                    path="/featuredproducts/add"
                    element={<Featuredaddproducts />}
                  />
                  <Route
                    path="/featuredproducts/:id"
                    element={<Featuredaddproducts />}
                  />
                  <Route path="/notification" element={<NotificationMain />} />
                  <Route
                    path="/notifications/add"
                    element={<NotificationForm />}
                  />
                  <Route path="/systemUser" element={<SystemUser />}>
                    <Route index element={<SystemTable />} />
                    <Route path="add" element={<SystemForm mode="add" />} />
                    <Route
                      path="edit/:id"
                      element={<SystemForm mode="edit" />}
                    />
                  </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </main>
      </div>
    </div>
  );
};

export default App;
