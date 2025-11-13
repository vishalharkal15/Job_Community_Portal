import { useState } from 'react'

function Jobs() {
  const [jobs] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80k - $120k',
      description: 'Looking for an experienced Frontend Developer with React expertise.',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'StartUp Inc',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$90k - $130k',
      description: 'Seeking a Backend Developer proficient in Node.js and databases.',
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'Digital Solutions',
      location: 'San Francisco, CA',
      type: 'Contract',
      salary: '$100k - $150k',
      description: 'Full Stack Developer needed for exciting new projects.',
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      location: 'Remote',
      type: 'Part-time',
      salary: '$60k - $90k',
      description: 'Creative UI/UX Designer to join our design team.',
      posted: '5 days ago'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || job.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
          <p className="text-gray-600">Browse through hundreds of job opportunities</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                id="jobType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {filteredJobs.length} Jobs Found
          </h2>
          
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No jobs found matching your criteria.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{job.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.posted}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                    Apply Now
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition">
                    Save Job
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Jobs
