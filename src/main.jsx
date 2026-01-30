
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './common/authContext.jsx'
import { BrowserRouter, Router } from 'react-router-dom'
import AdminColorProvider from './pages/WebSetting/Webcolorsetting.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter basename='/'>
           <AdminColorProvider/>

     <AuthProvider>
     {/* <Router> */}
     <App />
     {/* </Router> */}
     </AuthProvider>

     </BrowserRouter>
     
 
  // </StrictMode>,
)
