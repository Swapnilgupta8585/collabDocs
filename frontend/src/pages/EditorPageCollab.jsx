/* EditorPageCollab.jsx */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useDocStore from "../store/docStore";
import ShareModal from "../components/ShareModal";
import Editor from "../components/Editor";
import docService from "../services/docService";

export default function EditorPageCollab() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setCurrentDoc, clearShareInfo } = useDocStore();

  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Resolve link and enforce edit permission
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const { docId, permission: perm } = await docService.getDocPermFromToken(token);
        if (perm !== "edit") {
          navigate(`/view/${token}`, { replace: true });
          return;
        }
        setPermission(perm);
        setCurrentDoc(docId);
      } catch {
        setError("Invalid or expired link.");
      } finally {
        setLoading(false);
      }
    }
    init();
    return () => clearShareInfo();
  }, [token, navigate, setCurrentDoc, clearShareInfo]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
            collab<span className="text-black">Docs</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-600"
            >
              SHARE
            </button>
            {showModal && <ShareModal onClose={() => setShowModal(false)} permission={permission} />}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Editor in collaborative mode */}
        <Editor token={token} permission={permission} />
      </main>
    </div>
  );
}