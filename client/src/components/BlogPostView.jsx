import { useState } from 'react'

function BlogPostView({ blog, onClose, canEdit, onEdit, onDelete }) {
  const [likes, setLikes] = useState(blog.likes || 0)
  const [hasLiked, setHasLiked] = useState(false)

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1)
      setHasLiked(true)
    } else {
      setLikes(likes - 1)
      setHasLiked(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {blog.category}
            </span>
            {canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose()
                    onEdit(blog)
                  }}
                  className="text-blue-600 hover:text-blue-700 transition p-2 rounded-full hover:bg-blue-50"
                  title="Edit Post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    onClose()
                    onDelete(blog.id)
                  }}
                  className="text-red-600 hover:text-red-700 transition p-2 rounded-full hover:bg-red-50"
                  title="Delete Post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="w-full h-96 bg-gray-200">
            <img 
              src={blog.featuredImage} 
              alt={blog.imageAlt || blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="px-8 py-8">
          {/* Title/Headline */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Description */}
          {blog.metaDescription && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {blog.metaDescription}
            </p>
          )}

          {/* Author & Date Info */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {blog.authorImage ? (
                <img 
                  src={blog.authorImage} 
                  alt={blog.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {blog.author.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{blog.author}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{blog.authorRole}</span>
                  <span>•</span>
                  <span>{blog.createdAt}</span>
                  {blog.readTime && (
                    <>
                      <span>•</span>
                      <span>{blog.readTime} min read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                  hasLiked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{likes}</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Introduction */}
          {blog.introduction && (
            <div className="mb-8">
              <div className="text-lg text-gray-700 leading-relaxed space-y-4">
                {blog.introduction.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-800 leading-relaxed space-y-6">
              {blog.bodyContent ? (
                blog.bodyContent.split('\n\n').map((section, idx) => (
                  <div key={idx}>
                    {section.startsWith('## ') ? (
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {section.replace('## ', '')}
                      </h2>
                    ) : section.startsWith('### ') ? (
                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                        {section.replace('### ', '')}
                      </h3>
                    ) : section.startsWith('- ') ? (
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        {section.split('\n').map((item, i) => (
                          <li key={i} className="text-gray-700">
                            {item.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{section}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-700 leading-relaxed">{blog.content}</p>
              )}
            </div>
          </div>

          {/* Internal & External Links */}
          {(blog.internalLinks?.length > 0 || blog.externalLinks?.length > 0) && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
              {blog.internalLinks?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">More from us:</h4>
                  <ul className="space-y-2">
                    {blog.internalLinks.map((link, idx) => (
                      <li key={idx}>
                        <a href={link.url} className="text-blue-600 hover:text-blue-800 hover:underline">
                          → {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {blog.externalLinks?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">External Resources:</h4>
                  <ul className="space-y-2">
                    {blog.externalLinks.map((link, idx) => (
                      <li key={idx}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                          → {link.title}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Conclusion */}
          {blog.conclusion && (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h3>
              <div className="text-gray-700 leading-relaxed space-y-4">
                {blog.conclusion.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Call-to-Action */}
          {blog.cta && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center mb-8">
              <h3 className="text-2xl font-bold mb-3">{blog.cta.title || 'Take Action Now!'}</h3>
              <p className="text-blue-50 mb-6">{blog.cta.description || 'Join our community and stay updated with the latest insights.'}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                {blog.cta.buttons?.map((button, idx) => (
                  <a
                    key={idx}
                    href={button.url}
                    className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
                  >
                    {button.text}
                  </a>
                )) || (
                  <>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
                      Subscribe to Newsletter
                    </button>
                    <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition">
                      Share This Post
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {blog.authorBio && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex gap-4">
                {blog.authorImage ? (
                  <img 
                    src={blog.authorImage} 
                    alt={blog.author}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{blog.author}</h4>
                  <p className="text-sm text-gray-600 mb-2">{blog.authorRole}</p>
                  <p className="text-gray-700 leading-relaxed">{blog.authorBio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Share Options */}
        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Share this post:</p>
            <div className="flex gap-3">
              <button className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition" title="Share on Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </button>
              <button className="text-blue-700 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition" title="Share on LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
              <button className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition" title="Share on WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostView
