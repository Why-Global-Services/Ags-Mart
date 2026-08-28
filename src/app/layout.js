import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import Topbar from "./common/Topbar";
import Footer from "./common/Footer";
import Navbar from "./common/navbar";
import NavbarBottom from "./common/NavbarBottom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import Script from "next/script";
import { FaWhatsapp } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react"; // ← ADD THIS
import AdminProfileProvider from "./provider/AdminProfileProvider";
import WhatsappButton from "./common/WhatsAppButton";
import { GA_TRACKING_ID } from "../app/lib/ga";
import { Provider } from "react-redux";
import { store } from "../app/store";
import ClientProviders from "./provider/ClientProviders";
import CategoryNavbar from "./common/CategoriesNavbar";
import WelcomePopup from "./common/CouponPopup";



const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fonttitle",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fontcontent",
});

export const metadata = {
  title: {
    default: "Povi Collections | Trendy Covering & Fashion Jewellery Online",
    template: "%s | Povi Collections",
  },

  description:
    "Shop stylish covering jewellery, imitation jewellery and fashion accessories at Povi Collections. Discover trendy designs for weddings, parties and daily wear.",

  keywords: [
    "Povi Collections",
    "covering jewellery",
    "imitation jewellery",
    "artificial jewellery",
    "fashion jewellery online",
    "party wear jewellery",
    "bridal imitation jewellery",
    "temple imitation jewellery",
    "traditional covering jewellery",
    "designer artificial jewellery",
    "cheap jewellery online india",
    "jewellery shop online",
  ],

  authors: [{ name: "Povi Collections" }],

  creator: "Povi Collections",

  metadataBase: new URL("https://povicollections.in"), // 🔁 Change if needed

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    title: "Povi Collections | Covering & Imitation Jewellery Store",
    description:
      "Buy premium quality covering and artificial jewellery online from Povi Collections. Perfect for weddings, festivals and daily fashion.",

    url: "https://povicollections.in",
    siteName: "Povi Collections",

    images: [
      {
        url: "https://facesync.blr1.digitaloceanspaces.com/Websetting/NATURESHUNT_1770095195323_povi-logo.jpeg", // 🔁 Replace with real image
        width: 1200,
        height: 630,
        alt: "Povi Collections Covering Jewellery",
      },
    ],

    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Povi Collections | Covering Jewellery Online",
    description:
      "Trendy covering and imitation jewellery collections at affordable prices.",

    images: ["https://facesync.blr1.digitaloceanspaces.com/Websetting/NATURESHUNT_1770095195323_povi-logo.jpeg"], // 🔁 Replace
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
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
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