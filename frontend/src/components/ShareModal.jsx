import { useEffect, useState } from "react";
import useDocStore from "../store/docStore";
import docService from "../services/docService";

export default function ShareModal({ onClose, permission }) {
  const { currentDocId, share, setShareInfo,  clearShareInfo } = useDocStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear previous share info when modal opens
  useEffect(() => {
    clearShareInfo();
  }, [clearShareInfo]);

  const generateLink = async (perm) => {
    try {
      setLoading(true);
      const { link } = await docService.getLink(currentDocId, perm);
      const url = `${window.location.origin}/${perm}/${link.token}`;
      setShareInfo({ token: link.token, url, permission: link.permission});
    } catch (err) {
      console.log(err)
      setError("Unable to generate link, please try again.");
    } finally {
      setLoading(false);
    }
  };

    const handleClose = () => {
    clearShareInfo();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Share Document</h2>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => generateLink("view")}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              loading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {loading ? "…Generating" : "Generate View Link"}
          </button>

         <button
            onClick={() => generateLink("edit")}
            disabled={loading || permission === "view"}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "…Generating" : "Generate Collaborative Link"}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        {share.url && (
          <div className="mt-4 p-3 border border-gray-300 rounded bg-gray-50">
            <p className="mb-1 font-medium">
              {share.permission === "view" ? "Read-only link:" : "Editable link:"}
            </p>
            <input
              type="text"
              value={share.url}
              readOnly
              className="w-full p-2 border rounded bg-white text-sm"
              onClick={(e) => e.target.select()}
            />
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={() => {
             handleClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
