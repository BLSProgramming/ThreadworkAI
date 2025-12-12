import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './Pages/LandingPage.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import CompleteProfile from './Pages/CompleteProfile.jsx'
import HomePage from './Pages/HomePage.jsx'
import UserSettings from './Pages/UserSettings.jsx'
import FAQ from './Pages/FAQ.jsx'
import ContactUs from './Pages/ContactUs.jsx'
import Layout from './Layout.jsx'
import AuthWrapper from './Components/AuthWrapper.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<AuthWrapper><CompleteProfile /></AuthWrapper>} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/home" element={<AuthWrapper><Layout><HomePage /></Layout></AuthWrapper>} />
        <Route path="/chat/:chatId" element={<AuthWrapper><Layout><HomePage /></Layout></AuthWrapper>} />
        <Route path="/settings" element={<AuthWrapper><Layout><UserSettings /></Layout></AuthWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
