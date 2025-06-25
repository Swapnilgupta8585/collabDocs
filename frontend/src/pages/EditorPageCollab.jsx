/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useDocStore from "../store/docStore";
import ShareModal from "../components/ShareModal";
import Editor from "../components/Editor";
import docService from "../services/docService";
import { motion, AnimatePresence } from "framer-motion";

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
          <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
            collab<span className="text-gray-800 dark:text-gray-100">Docs</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-full cursor-pointer bg-blue-600 dark:bg-blue-500 text-white text-sm hover:bg-blue-700 dark:hover:bg-blue-600 hover:scale-105 transition"
            >
              SHARE
            </button>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto px-6 py-10"
      >
        <Editor token={token} permission={permission} />
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

