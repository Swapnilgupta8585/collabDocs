/* EditorViewPage.jsx */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import docService from "../services/docService";
import useDocStore from "../store/docStore";
import ShareModal from "../components/ShareModal";

export default function EditorViewPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { setCurrentDoc, clearShareInfo } = useDocStore();

    const [permission, setPermission] = useState(null)
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                const { docId, content, permission } = await docService.getDocPermFromToken(token);
                if (permission !== "view") {
                    navigate(`/edit/${token}`, { replace: true });
                    return;
                }
                setCurrentDoc(docId);
                setPermission(permission)
                setContent(content);
            } catch {
                setError("Invalid or expired link.");
            } finally {
                setLoading(false);
            }
        }
        init();
        return () => clearShareInfo();
    }, [token, navigate, setCurrentDoc, clearShareInfo]);

    if (loading) return <div className="p-8">Loading document...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
                        collab<span className="text-black">Docs</span>
                    </h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-600"
                    >
                        SHARE
                    </button>
                    {showModal && <ShareModal onClose={() => setShowModal(false)} permission={permission} />}
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="prose max-w-none whitespace-pre-wrap">
                    {content}
                </div>
            </main>

        </div>
    );
}