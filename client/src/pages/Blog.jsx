import { useState, useEffect } from 'react'
import { auth, db } from '../firebase/firebaseConfig'
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import BlogPostView from '../components/BlogPostView'

function Blog() {
  const [blogs, setBlogs] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null) // 'company', 'recruiter', 'user'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [viewingBlog, setViewingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    metaDescription: '',
    category: '',
    introduction: '',
    bodyContent: '',
    conclusion: '',
    author: '',
    authorRole: '',
    authorBio: '',
    authorImage: '',
    featuredImage: '',
    imageAlt: '',
    readTime: '',
    ctaTitle: '',
    ctaDescription: '',
    internalLinks: '',
    externalLinks: ''
  })
  const [loading, setLoading] = useState(true)

  // Categories for blog posts
  const categories = [
    'Career Tips',
    'Industry Insights',
    'Job Search',
    'Interview Tips',
    'Company Culture',
    'Recruitment',
    'Technology',
    'HR Trends'
  ]

  // Check user authentication and role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        // In a real app, fetch user role from Firestore
        // For demo, we'll check email domain or set it manually
        const role = getUserRole(user.email)
        setUserRole(role)
      } else {
        setCurrentUser(null)
        setUserRole(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Fetch blogs from Firestore
  useEffect(() => {
    fetchBlogs()
  }, [])

  const getUserRole = (email) => {
    // Demo: determine role based on email
    // In production, fetch from Firestore user document
    if (email.includes('company') || email.includes('corp')) {
      return 'company'
    } else if (email.includes('recruiter') || email.includes('hr')) {
      return 'recruiter'
    }
    return 'user'
  }

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(blogsQuery)
      const blogsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
      }))
      setBlogs(blogsData)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      // Load demo data if Firestore fails
      setBlogs(getDemoBlogs())
    } finally {
      setLoading(false)
    }
  }

  const getDemoBlogs = () => [
    {
      id: '1',
      title: 'Top 10 Interview Tips for Software Engineers in 2025',
      metaDescription: 'Master your next technical interview with these proven strategies and expert insights from top tech companies.',
      category: 'Interview Tips',
      introduction: 'Are you preparing for your next software engineering interview? You\'re not alone. With over 70% of candidates feeling nervous about technical interviews, it\'s crucial to be well-prepared. This comprehensive guide will walk you through the most effective strategies to ace your next interview.',
      bodyContent: '## Understanding the Interview Process\n\nModern technical interviews typically consist of multiple stages. Let\'s break down what you can expect.\n\n### The Screening Stage\n\nThe first stage usually involves a phone screen or initial video call. Recruiters assess your communication skills and basic technical knowledge.\n\n### Technical Assessment\n\n- Coding challenges on platforms like HackerRank or LeetCode\n- System design questions for senior positions\n- Live coding sessions with an engineer\n- Take-home projects\n\n## Key Preparation Strategies\n\nSuccess in technical interviews requires a structured approach. Here are the most effective methods:\n\nFirst, practice coding problems daily. Consistency is more important than marathon study sessions. Aim for at least 1-2 problems per day.\n\nSecond, understand data structures and algorithms thoroughly. Focus on arrays, linked lists, trees, graphs, and dynamic programming.\n\n### Communication is Crucial\n\nMany candidates underestimate the importance of explaining their thought process. Always verbalize your approach before writing code.',
      conclusion: 'Technical interviews can be challenging, but with proper preparation and the right mindset, you can significantly improve your performance. Remember to practice regularly, focus on understanding concepts deeply, and don\'t forget to showcase your communication skills. Your next great opportunity is just one successful interview away!',
      author: 'Sarah Johnson',
      authorRole: 'Company',
      authorBio: 'Sarah Johnson is the Head of Technical Recruitment at Tech Corp with over 10 years of experience in hiring software engineers. She has interviewed thousands of candidates and helped shape hiring practices at Fortune 500 companies.',
      authorImage: '',
      featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop',
      imageAlt: 'Professional software engineer preparing for interview',
      readTime: '8',
      cta: {
        title: 'Ready to Land Your Dream Job?',
        description: 'Subscribe to our newsletter for weekly interview tips and job opportunities.',
        buttons: [
          { text: 'Subscribe Now', url: '#' },
          { text: 'Browse Jobs', url: '/jobs' }
        ]
      },
      internalLinks: [
        { title: 'How to Build a Developer Portfolio', url: '/blog/2' },
        { title: 'Remote Work Best Practices', url: '/blog/3' }
      ],
      externalLinks: [
        { title: 'LeetCode Practice Platform', url: 'https://leetcode.com' },
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }
      ],
      createdAt: new Date().toLocaleDateString(),
      likes: 45
    },
    {
      id: '2',
      title: 'How to Build a Standout Developer Portfolio That Gets Noticed',
      metaDescription: 'Create a compelling developer portfolio that showcases your skills and attracts recruiters. Complete guide with examples and best practices.',
      category: 'Career Tips',
      introduction: 'Did you know that 85% of recruiters check a candidate\'s portfolio before reaching out? Your portfolio is often the first impression you make on potential employers. In this guide, we\'ll show you exactly how to create a portfolio that stands out from the crowd and lands you interviews.',
      bodyContent: '## Why Your Portfolio Matters\n\nYour portfolio serves as living proof of your skills and experience. Unlike a resume, it demonstrates what you can actually build.\n\n### Essential Components\n\n- Personal branding and professional photo\n- Clear navigation and user-friendly design\n- Project showcases with live demos\n- Technical skills and tools you use\n- Contact information and social links\n\n## Choosing the Right Projects\n\nQuality trumps quantity every time. Here\'s how to select projects that impress:\n\nShowcase 3-5 of your best projects that demonstrate different skills. Each project should solve a real problem and show your technical range.\n\n### Project Presentation Tips\n\nFor each project, include:\n- A compelling title and brief description\n- The technologies used\n- Your role and contributions\n- Challenges you overcame\n- Links to live demo and source code\n\n## Design and User Experience\n\nYour portfolio\'s design speaks volumes about your attention to detail. Keep it clean, professional, and easy to navigate.',
      conclusion: 'A well-crafted portfolio is your ticket to better job opportunities. Invest time in building something that truly represents your skills and personality. Remember to keep it updated with your latest projects and continuously refine it based on feedback. Your portfolio is never truly "finished" – it evolves with your career.',
      author: 'Michael Chen',
      authorRole: 'Recruiter',
      authorBio: 'Michael Chen is a Senior Technical Recruiter at StartUp Inc, specializing in placing developers at high-growth tech companies. He reviews hundreds of portfolios monthly and knows exactly what catches a recruiter\'s eye.',
      authorImage: '',
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      imageAlt: 'Developer working on portfolio website',
      readTime: '6',
      cta: {
        title: 'Start Building Your Portfolio Today!',
        description: 'Get our free portfolio template and checklist to create your standout portfolio.',
        buttons: [
          { text: 'Download Template', url: '#' },
          { text: 'View Examples', url: '#' }
        ]
      },
      internalLinks: [
        { title: 'Top Interview Tips', url: '/blog/1' },
        { title: 'Tech Industry Insights', url: '/blog/3' }
      ],
      externalLinks: [
        { title: 'GitHub Portfolio Guide', url: 'https://github.com' },
        { title: 'Portfolio Design Inspiration', url: 'https://dribbble.com' }
      ],
      createdAt: new Date().toLocaleDateString(),
      likes: 32
    },
    {
      id: '3',
      title: 'Remote Work Revolution: The Future of Employment is Here',
      metaDescription: 'Explore how remote work is transforming the job market and what it means for your career in 2025 and beyond.',
      category: 'Industry Insights',
      introduction: 'The workplace landscape has undergone a seismic shift. With 74% of companies planning to maintain remote work policies post-pandemic, understanding this new normal isn\'t just helpful – it\'s essential. Let\'s dive into what this means for your career and how to thrive in this new environment.',
      bodyContent: '## The Remote Work Evolution\n\nRemote work isn\'t just a temporary trend; it\'s a fundamental restructuring of how we work.\n\n### Key Statistics\n\n- 74% of companies plan permanent remote options\n- Remote workers report 25% higher productivity\n- 68% of employees prefer hybrid arrangements\n- Global talent pool has expanded by 300%\n\n## Benefits for Employees\n\nThe advantages of remote work extend far beyond avoiding the commute:\n\nFlexibility in scheduling allows better work-life balance. You can structure your day around peak productivity hours and personal commitments.\n\nCost savings are significant. The average remote worker saves $4,000 annually on commuting, meals, and professional attire.\n\n### Challenges to Consider\n\nRemote work isn\'t without its hurdles:\n- Maintaining work-life boundaries\n- Combating isolation and loneliness\n- Communication gaps with team members\n- Home office setup costs\n\n## Best Practices for Remote Success\n\nCreate a dedicated workspace. Physical separation between work and personal spaces helps maintain boundaries and focus.\n\nEstablish a routine. Start and end your workday at consistent times to maintain structure.',
      conclusion: 'Remote work is reshaping the employment landscape in profound ways. Whether you\'re a job seeker exploring remote opportunities or an employer adapting to this new reality, understanding and embracing these changes is key to success. The future of work is flexible, global, and digital – and it\'s happening now.',
      author: 'Emily Rodriguez',
      authorRole: 'Company',
      authorBio: 'Emily Rodriguez is the VP of People Operations at Digital Solutions, a fully remote company with 500+ employees across 30 countries. She has pioneered remote work policies and helped hundreds of companies transition to distributed teams.',
      authorImage: '',
      featuredImage: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=400&fit=crop',
      imageAlt: 'Professional working remotely from home office',
      readTime: '7',
      cta: {
        title: 'Ready to Go Remote?',
        description: 'Explore remote job opportunities and learn how to excel in a distributed workplace.',
        buttons: [
          { text: 'Browse Remote Jobs', url: '/jobs' },
          { text: 'Remote Work Guide', url: '#' }
        ]
      },
      internalLinks: [
        { title: 'Interview Tips for Remote Positions', url: '/blog/1' },
        { title: 'Building Your Online Presence', url: '/blog/2' }
      ],
      externalLinks: [
        { title: 'Remote Work Report 2025', url: 'https://example.com' },
        { title: 'Best Remote Work Tools', url: 'https://example.com' }
      ],
      createdAt: new Date().toLocaleDateString(),
      likes: 67
    }
  ]

  const canEditBlog = () => {
    return userRole === 'company' || userRole === 'recruiter'
  }

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog)
      setFormData({
        title: blog.title || '',
        metaDescription: blog.metaDescription || '',
        category: blog.category || categories[0],
        introduction: blog.introduction || '',
        bodyContent: blog.bodyContent || blog.content || '',
        conclusion: blog.conclusion || '',
        author: blog.author || '',
        authorRole: blog.authorRole || '',
        authorBio: blog.authorBio || '',
        authorImage: blog.authorImage || '',
        featuredImage: blog.featuredImage || blog.image || '',
        imageAlt: blog.imageAlt || '',
        readTime: blog.readTime || '',
        ctaTitle: blog.cta?.title || '',
        ctaDescription: blog.cta?.description || '',
        internalLinks: blog.internalLinks?.map(l => `${l.title}|${l.url}`).join('\n') || '',
        externalLinks: blog.externalLinks?.map(l => `${l.title}|${l.url}`).join('\n') || ''
      })
    } else {
      setEditingBlog(null)
      setFormData({
        title: '',
        metaDescription: '',
        category: categories[0],
        introduction: '',
        bodyContent: '',
        conclusion: '',
        author: currentUser?.displayName || currentUser?.email || '',
        authorRole: userRole === 'company' ? 'Company' : 'Recruiter',
        authorBio: '',
        authorImage: '',
        featuredImage: '',
        imageAlt: '',
        readTime: '',
        ctaTitle: '',
        ctaDescription: '',
        internalLinks: '',
        externalLinks: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBlog(null)
    setFormData({
      title: '',
      metaDescription: '',
      category: '',
      introduction: '',
      bodyContent: '',
      conclusion: '',
      author: '',
      authorRole: '',
      authorBio: '',
      authorImage: '',
      featuredImage: '',
      imageAlt: '',
      readTime: '',
      ctaTitle: '',
      ctaDescription: '',
      internalLinks: '',
      externalLinks: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Process links from text format to array format
      const processLinks = (linksString) => {
        if (!linksString.trim()) return []
        return linksString.split('\n').filter(l => l.trim()).map(link => {
          const [title, url] = link.split('|').map(s => s.trim())
          return { title, url }
        })
      }

      const blogData = {
        title: formData.title,
        metaDescription: formData.metaDescription,
        category: formData.category,
        introduction: formData.introduction,
        bodyContent: formData.bodyContent,
        conclusion: formData.conclusion,
        author: formData.author,
        authorRole: formData.authorRole,
        authorBio: formData.authorBio,
        authorImage: formData.authorImage,
        featuredImage: formData.featuredImage,
        imageAlt: formData.imageAlt,
        readTime: formData.readTime,
        cta: {
          title: formData.ctaTitle,
          description: formData.ctaDescription,
          buttons: [
            { text: 'Get Started', url: '#' },
            { text: 'Learn More', url: '#' }
          ]
        },
        internalLinks: processLinks(formData.internalLinks),
        externalLinks: processLinks(formData.externalLinks)
      }
      
      if (editingBlog) {
        // Update existing blog
        const blogRef = doc(db, 'blogs', editingBlog.id)
        await updateDoc(blogRef, {
          ...blogData,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new blog
        await addDoc(collection(db, 'blogs'), {
          ...blogData,
          createdAt: serverTimestamp(),
          userId: currentUser.uid,
          likes: 0
        })
      }
      
      handleCloseModal()
      fetchBlogs()
    } catch (error) {
      console.error('Error saving blog:', error)
      alert('Failed to save blog post. Please try again.')
    }
  }

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteDoc(doc(db, 'blogs', blogId))
        fetchBlogs()
      } catch (error) {
        console.error('Error deleting blog:', error)
        alert('Failed to delete blog post.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Blog</h1>
            <p className="text-gray-600">Insights, tips, and trends from industry experts</p>
          </div>
          
          {canEditBlog() && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Blog Post
            </button>
          )}
        </div>

        {/* Role Badge */}
        {currentUser && (
          <div className="mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              userRole === 'company' ? 'bg-blue-100 text-blue-800' :
              userRole === 'recruiter' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userRole === 'company' ? '🏢 Company Account' :
               userRole === 'recruiter' ? '👔 Recruiter Account' :
               '👤 User Account'}
            </span>
          </div>
        )}

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your insights!</p>
            {canEditBlog() && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                {/* Blog Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {blog.title.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                    {blog.category}
                  </span>
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.content}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{blog.author}</span>
                      <span className="text-gray-400">•</span>
                      <span>{blog.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm">{blog.likes || 0}</span>
                      </button>
                      <button 
                        onClick={() => setViewingBlog(blog)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Read More →
                      </button>
                    </div>

                    {canEditBlog() && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(blog)}
                          className="text-gray-600 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="text-gray-600 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Blog Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Blog Post Template Format</h4>
                  <p className="text-xs text-blue-800">Follow this structured format to create professional, SEO-optimized blog posts.</p>
                </div>

                {/* Title/Headline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title/Headline * <span className="text-xs text-gray-500">(55-65 characters recommended)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="65"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Catchy, descriptive title with target keyword"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/65 characters</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description * <span className="text-xs text-gray-500">(150-160 characters)</span>
                  </label>
                  <textarea
                    required
                    maxLength="160"
                    rows="2"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief summary for search results"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Introduction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction * <span className="text-xs text-gray-500">(Hook with question, statistic, or anecdote)</span>
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start with a hook that introduces the topic and explains relevance..."
                  />
                </div>

                {/* Body Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Content * <span className="text-xs text-gray-500">(Use ## for H2, ### for H3, - for bullets)</span>
                  </label>
                  <textarea
                    required
                    rows="12"
                    value={formData.bodyContent}
                    onChange={(e) => setFormData({ ...formData, bodyContent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="## Main Section\n\nYour content here...\n\n### Subsection\n\n- Bullet point 1\n- Bullet point 2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Organize with H2/H3 headings, short paragraphs, and lists</p>
                </div>

                {/* Conclusion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conclusion * <span className="text-xs text-gray-500">(Summary of key points)</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.conclusion}
                    onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Summarize key takeaways and provide closure..."
                  />
                </div>

                {/* Visuals Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visuals</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.featuredImage}
                        onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Alt Text <span className="text-xs text-gray-500">(SEO)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.imageAlt}
                        onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descriptive alt text for image"
                      />
                    </div>
                  </div>
                </div>

                {/* Links Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links (SEO & Resources)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Links <span className="text-xs text-gray-500">(Format: Title|URL, one per line)</span>
                      </label>
                      <textarea
                        rows="3"
                        value={formData.internalLinks}
                        onChange={(e) => setFormData({ ...formData, internalLinks: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Related Article|/blog/1&#10;Another Post|/blog/2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        External Links <span className="text-xs text-gray-500">(Format: Title|URL, one per line)</span>
                      </label>
                      <textarea
                        rows="3"
                        value={formData.externalLinks}
                        onChange={(e) => setFormData({ ...formData, externalLinks: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Resource Name|https://example.com&#10;Study|https://example.org"
                      />
                    </div>
                  </div>
                </div>

                {/* Call-to-Action */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Call-to-Action (CTA)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Title
                      </label>
                      <input
                        type="text"
                        value={formData.ctaTitle}
                        onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ready to Take Action?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Description
                      </label>
                      <textarea
                        rows="2"
                        value={formData.ctaDescription}
                        onChange={(e) => setFormData({ ...formData, ctaDescription: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Encourage readers to subscribe, comment, or share..."
                      />
                    </div>
                  </div>
                </div>

                {/* Author Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Author Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Author Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your name or company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Author Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.authorImage}
                          onChange={(e) => setFormData({ ...formData, authorImage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/profile.jpg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Bio <span className="text-xs text-gray-500">(Adds credibility and trust)</span>
                      </label>
                      <textarea
                        rows="3"
                        value={formData.authorBio}
                        onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Short bio about the author's expertise and background..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Read Time <span className="text-xs text-gray-500">(minutes)</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
                  >
                    {editingBlog ? 'Update Post' : 'Publish Post'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Blog Post View Modal */}
        {viewingBlog && (
          <BlogPostView
            blog={viewingBlog}
            onClose={() => setViewingBlog(null)}
            canEdit={canEditBlog()}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}

export default Blog
