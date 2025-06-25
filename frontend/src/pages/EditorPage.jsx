/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useDocStore from "../store/docStore";
import docService from "../services/docService";
import ShareModal from "../components/ShareModal";
import Editor from "../components/Editor";
import { motion, AnimatePresence } from "framer-motion";



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
        console.log(doc)
        setOwnerId(doc.user_id);
        setCurrentDoc(doc.id);
      } catch {
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
    return () => clearShareInfo();
  }, [docId, setCurrentDoc, clearShareInfo]);

  const isOwner = user.id === ownerId;
  const permission = isOwner ? "edit" : "view";

    const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await docService.deleteDoc(docId);
      navigate("/dashboard");
    } catch {
      alert("Unable to delete document.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white-500 dark:text-blue-500 text-lg  bg-gray-800 dark:bg-gray-900">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-400 dark:text-red-400 text-lg  bg-gray-800 dark:bg-gray-900">
        {error}
      </div>
    );

  return (
      <div
        className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100"
    >
      <header
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            collab<span className="text-gray-800 dark:text-gray-100">Docs</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              disabled={!docId}
              className="px-4 py-2 rounded-full cursor-pointer bg-blue-600 dark:bg-blue-500 text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105 transition"
            >
              Share
            </button>
            <button
              onClick={() => {handleDelete()}}
              disabled={!isOwner}
              className="px-4 py-2 rounded-full cursor-pointer bg-red-500 text-white-600 text-sm hover:bg-red-700 hover:scale-105 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </header>
    
    <main
        className="max-w-7xl mx-auto px-6 py-10"
      >
        <Editor permission={permission} />
      </main>

      <AnimatePresence>
              {showModal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
                >
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-lg"
                  >
                    <ShareModal
                      onClose={() => setShowModal(false)}
                      permission={permission}
                    />
                  </motion.div>
                </motion.div>
              )}
        </AnimatePresence>
            
    </div>
  );
}

