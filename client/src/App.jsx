import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Blog from './components/Blog/Blog'
import CreateBlog from './components/Blog/CreateBlog'
import Services from './pages/Services'
import Jobs from './components/Jobs/Jobs'
import BookMeeting from './pages/BookMeeting'
import Profile from './pages/Profile'
import CompanyEdit from './pages/CompanyEdit'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import BlogList from "./components/Blog/BlogList";
import BlogDetails from "./components/Blog/BlogDetails";
import CreateJob from './components/Jobs/CreateJob'
import JobDetails from './components/Jobs/JobDetails'
import AdminPage from './admin/AdminPage';
import Notifications from './pages/Notifications'
import MeetingApprovalPage from './pages/MeetingApprovalPage'
import CompanyDashboard from './pages/CompanyDashboard'
import CompanyProfile from './pages/CompanyProfile'
import Companies from './pages/Companies'
import CompanyPage from './pages/CompanyPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
            <Route path="/create-blog" element={<CreateBlog />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book-meeting" element={<BookMeeting />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/company/edit" element={<CompanyEdit />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/meeting-approval" element={<MeetingApprovalPage />} />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:id" element={<CompanyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
