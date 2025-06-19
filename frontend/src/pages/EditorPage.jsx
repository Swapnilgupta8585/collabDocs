/* EditorPage.jsx */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useDocStore from "../store/docStore";
import docService from "../services/docService";
import ShareModal from "../components/ShareModal";
import Editor from "../components/Editor";

export default function EditorPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCurrentDoc, clearShareInfo } = useDocStore();

  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);



  // Fetch document metadata on mount
  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const { doc } = await docService.getDocById(docId);
        setOwnerId(doc.user_id);
        setCurrentDoc(doc.id);
        console.log("editor page",doc.id)
      } catch {
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
    // cleanup share info when unmount
    return () => clearShareInfo();
  }, [docId, setCurrentDoc, clearShareInfo]);

  const isOwner = user.id === ownerId;
  const permission = isOwner ? "edit" : "view"

  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await docService.deleteDoc(docId);
      navigate("/dashboard");
    } catch {
      alert("Unable to delete document.");
    }
  };

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
              disabled={!docId}
              className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 transition hover:bg-green-100 hover:text-green-600 hover:shadow-md hover:scale-105 focus:outline-none"
            >
              SHARE
            </button>
            {showModal && <ShareModal onClose={() => setShowModal(false)} permission={permission}/>}

            <button
              onClick={handleDelete}
              disabled={!isOwner}
              className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 transition hover:bg-red-100 hover:text-red-600 hover:shadow-md hover:scale-105 focus:outline-none"
            >
              DELETE
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Editor permission={permission} />
      </main>
    </div>
  );
}
