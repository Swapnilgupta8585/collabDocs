/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import authService from "../services/authService";
import docService from "../services/docService";
import useDocStore from "../store/docStore";
import { useEffect, useState } from "react";
import NewDocModal from "../components/DocModal";
import { motion, AnimatePresence } from "framer-motion";

const pageClasses = "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";
const headerClasses = "bg-white/80 dark:bg-gray-800 backdrop-blur-lg ring-1 ring-gray-200 dark:ring-gray-700 shadow-md";
const cardBase = "p-5 bg-white dark:bg-gray-800 rounded-2xl ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { documents, setDocuments } = useDocStore();

  const handleLogout = async () => {
    try {
      authService.logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const userDocs = await docService.getUserDoc();
        setDocuments(userDocs);
      } catch (error) {
        authService.logout();
        navigate("/login", { replace: true });
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  return (
    <div
      className={`${pageClasses}`}
    >
      <header className={headerClasses} >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
            collab<span className="text-gray-800 dark:text-gray-100">Docs</span>
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-full cursor-pointer bg-white dark:bg-red-500 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 transition hover:bg-red-700 hover:text-white-500 hover:shadow-lg hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10" >
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1 ">
              Your Documents
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome, {user?.full_name || "User"} 👋
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-3 py-1 sm:px-5 sm:py-2 rounded-full cursor-pointer bg-blue-600 dark:bg-blue-500 text-white text-sm shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition"
          >
            + New Document
          </button>
        </div>


        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.isArray(documents) &&
            documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className={`${cardBase} hover:scale-105`}
              >
                <div className="text-lg font-medium mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {doc.doc_name}
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  Last edited: {
                    new Date(doc.updated_at).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata", 
                    })
                  }
                </div>
              </div>
            ))}
        </div>
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
              <NewDocModal onClose={() => setShowModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
