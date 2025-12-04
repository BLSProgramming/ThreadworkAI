import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import HomePage from './Pages/HomePage.jsx'
import UserSettings from './Pages/UserSettings.jsx'
import Layout from './Layout.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Layout><HomePage /></Layout>} />
        <Route path="/chat/:chatId" element={<Layout><HomePage /></Layout>} />
        <Route path="/settings" element={<Layout><UserSettings /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
