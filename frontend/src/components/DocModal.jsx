import { useState, useEffect } from "react";
import docService from "../services/docService";
import { useNavigate } from "react-router-dom";

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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">New Document</h2>

        <label className="block mb-2 text-sm font-medium">Document Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter document title..."
          className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
