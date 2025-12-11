import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './Pages/LandingPage.jsx'
import EmailLogin from './Pages/EmailLogin.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import CompleteProfile from './Pages/CompleteProfile.jsx'
import HomePage from './Pages/HomePage.jsx'
import UserSettings from './Pages/UserSettings.jsx'
import FAQ from './Pages/FAQ.jsx'
import ContactUs from './Pages/ContactUs.jsx'
import Layout from './Layout.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-login" element={<EmailLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/home" element={<Layout><HomePage /></Layout>} />
        <Route path="/chat/:chatId" element={<Layout><HomePage /></Layout>} />
        <Route path="/settings" element={<Layout><UserSettings /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
