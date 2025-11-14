import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Services from './pages/Services'
import Jobs from './pages/Jobs'
import BookMeeting from './pages/BookMeeting'
import Profile from './pages/Profile'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book-meeting" element={<BookMeeting />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
