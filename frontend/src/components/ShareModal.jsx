import { useEffect, useState } from "react";
import useDocStore from "../store/docStore";
import docService from "../services/docService";

// Overlay and container styles for theme consistency
const overlayClasses = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const containerClasses = "bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-lg ring-1 ring-gray-200 dark:ring-gray-700";
const titleClasses = "text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100";
const buttonBase = "px-5 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";

export default function ShareModal({ onClose, permission }) {
  const { currentDocId, share, setShareInfo, clearShareInfo } = useDocStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearShareInfo();
  }, [clearShareInfo]);

  const generateLink = async (perm) => {
    try {
      setLoading(true);
      const { link } = await docService.getLink(currentDocId, perm);
      const url = `${window.location.origin}/${perm}/${link.token}`;
      setShareInfo({ token: link.token, url, permission: link.permission });
    } catch (err) {
      console.error(err);
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
    <div className={overlayClasses}>
      <div className={containerClasses}>
          <h2 className={titleClasses}>Share Document</h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => generateLink("view")}
            disabled={loading}
            className={`${buttonBase} ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"} text-gray-800 dark:text-gray-200 cursor-pointer`}
          >
            {loading ? "Generating..." : "View Link"}
          </button>

          <button
            onClick={() => generateLink("edit")}
            disabled={loading || permission === "view"}
            className={`${buttonBase} text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} cursor-pointer`}
          >
            {loading ? "Generating..." : "Edit Link"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {share.url && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg mb-6">
            <p className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
              {share.permission === "view" ? "Read-Only Link:" : "Editable Link:"}
            </p>
            <input
              type="text"
              value={share.url}
              readOnly
              onClick={(e) => e.target.select()}
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => {handleClose()}}
            className={`${buttonBase} bg-red-500 hover:bg-red-600 text-white cursor-pointer`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
