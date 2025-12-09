import { useState } from "react";
import { FileCheck, Upload, Download, Trash2, Eye } from "lucide-react";

export default function ComplianceDocuments({ companyProfile }) {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "PAN Card",
      type: "PAN",
      uploadDate: "2024-01-15",
      status: "Verified",
      fileSize: "2.3 MB",
    },
    {
      id: 2,
      name: "GST Certificate",
      type: "GST",
      uploadDate: "2024-01-20",
      status: "Verified",
      fileSize: "1.8 MB",
    },
    {
      id: 3,
      name: "Incorporation Certificate",
      type: "Incorporation",
      uploadDate: "2024-02-10",
      status: "Pending",
      fileSize: "3.1 MB",
    },
    {
      id: 4,
      name: "HR Policy Document",
      type: "HR Policy",
      uploadDate: "2024-03-05",
      status: "Verified",
      fileSize: "4.5 MB",
    },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "PAN" });

  const handleUpload = () => {
    const doc = {
      id: Date.now(),
      ...newDoc,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      fileSize: "2.0 MB",
    };
    setDocuments([...documents, doc]);
    setNewDoc({ name: "", type: "PAN" });
    setShowUploadModal(false);
    alert("Document uploaded successfully!");
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter((d) => d.id !== id));
    }
  };

  const statusColors = {
    Verified: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    Pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    Rejected: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-blue-600" />
          Compliance Documents
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{doc.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
                {doc.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>File Size:</span>
                <span>{doc.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Upload Date:</span>
                <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Upload Document
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Type
                </label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="PAN">PAN Card</option>
                  <option value="GST">GST Certificate</option>
                  <option value="Incorporation">Incorporation Certificate</option>
                  <option value="HR Policy">HR Policy</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter document name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
