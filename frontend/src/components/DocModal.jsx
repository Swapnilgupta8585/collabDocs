import { useState, useEffect } from "react";
import docService from "../services/docService";
import { useNavigate } from "react-router-dom";

// Overlay and container styles for theme consistency
const overlayClasses = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const containerClasses = "bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-lg ring-1 ring-gray-200 dark:ring-gray-700";
const titleClasses = "text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100";
const buttonBase = "px-5 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

export default function NewDocModal({ onClose }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset state when modal opens
    setName("");
    setError("");
    setLoading(false);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter a document name.");
      return;
    }

    try {
      setLoading(true);
      const newDoc = await docService.createDoc(name);
      navigate(`/editor/${newDoc.doc.id}`)
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={overlayClasses}>
      <div className={containerClasses}>
          <h2 className={titleClasses}>New Document</h2>
          

        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter document title..."
          className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
        />
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className={`${buttonBase} bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer`}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`${buttonBase} text-white ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} cursor-pointer`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

