import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Topbar from "./common/Topbar";
import Footer from "./common/Footer";
import Navbar from "./common/Navbar";
import NavbarBottom from "./common/NavbarBottom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import Script from "next/script";
import { FaWhatsapp } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import AdminProfileProvider from "./provider/AdminProfileProvider";
import WhatsappButton from "./common/WhatsAppButton";
import { GA_TRACKING_ID } from "../app/lib/ga";
import { Provider } from "react-redux";
import { store } from "../app/store";
import ClientProviders from "./provider/ClientProviders";
import CategoryNavbar from "./common/CategoriesNavbar";
import WelcomePopup from "./common/CouponPopup";



const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fontcontent",
});

export const metadata = {
  title: {
    default: "Agrowmed | Agriculture Products Online",
    template: "%s | Agrowmed",
  },

  description:
    "Buy Agriculture Products Online at Agrowmed. Wide range of Seeds, Crop Protection, Plant Nutrition, Fertilizers and Agricultural Equipment. Fast delivery across India.",

  keywords: [
    "Agrowmed",
    "agriculture products online",
    "buy seeds online",
    "crop protection",
    "plant nutrition",
    "fertilizers online",
    "agricultural equipment",
    "farming supplies",
    "organic farming",
    "pesticides online india",
    "agri inputs",
    "agro products",
  ],

  authors: [{ name: "Agrowmed" }],

  creator: "Agrowmed",

  metadataBase: new URL("https://agsmart.in"),

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "Agrowmed | Agriculture Products Online",
    description:
      "Buy premium quality seeds, fertilizers, crop protection products and agricultural equipment online at Agrowmed.",
    url: "https://agsmart.in",
    siteName: "Agrowmed",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Agrowmed Agriculture Products",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Agrowmed | Agriculture Products Online",
    description:
      "Seeds, fertilizers, crop protection and agricultural equipment at best prices.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};




export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
            <head>
        {/* Google Analytics */}
        {/* <Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
  strategy="afterInteractive"
/> */}

{/* <Script id="ga-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', { send_page_view: true });
  `}
</Script> */}
      </head>
      <body className={` antialiased`}>
        <ClientProviders>
        {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthProvider>
             <Provider store={store}> */}
            {/* ↓↓↓ THIS IS THE ONLY CHANGE YOU NEED ↓↓↓ */}
            <AdminProfileProvider >
            <Suspense fallback={<div className="h-16 md:h-20 bg-emerald-800" />}>
              <Topbar />
              <Navbar />
              <CategoryNavbar />
              <WelcomePopup />
              {/* <NavbarBottom /> */}
            </Suspense>
            {/* ↑↑↑ END OF CHANGE ↑↑↑ */}

            {children}

                        {/* ✅ Custom Toaster with bgvariant-2 and black theme */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerStyle={{}}
              toastOptions={{
                // Default options for all toasts
                duration: 4000,
                style: {
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "15px",
                  padding: "16px 24px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
                // Success toast
                success: {
                  style: {
                    background: "#047857", // bgvariant-2
                    color: "#ffffff",
                  },
                  iconTheme: {
                    primary: "#ffffff",
                    secondary: "#047857",
                  },
                },
                // Error toast
                error: {
                  style: {
                    background: "#000000", // black
                    color: "#ffffff",
                  },
                  iconTheme: {
                    primary: "#ffffff",
                    secondary: "#000000",
                  },
                },
                // Loading toast
                loading: {
                  style: {
                    background: "#6b7280", // gray-500
                    color: "#ffffff",
                  },
                },
              }}
            />
            <ToastContainer position="top-right" />

            <Footer />

            {/* WhatsApp Button */}
            
            <WhatsappButton />
            </AdminProfileProvider>
            {/* </Provider>
          </AuthProvider>
        </GoogleOAuthProvider> */}
        </ClientProviders>
      </body>
    </html>
  );
}