import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
