import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import authService from "../services/authService";
import docService from "../services/docService";
import useDocStore from "../store/docStore";
import { useEffect } from "react";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            authService.logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const { documents, setDocuments } = useDocStore();

    useEffect(() => {
        const fetchDocs = async () => {
            try{
                const userDocs = await docService.getUserDoc();
                setDocuments(userDocs)
            } catch(error){
                authService.logout();
                navigate("/login", { replace: true });
                console.error("Failed to fetch documents:", error);
            }
        };

        fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents]);

    const handleCreateNewDoc = async () => {
        const name = prompt("Enter a name for your document");

        if (name == null) return;

        const finalName = name.trim() === '' ? "Untitled Document" : name.trim();
        try{
            const newDoc = await docService.createDoc(finalName);
            navigate(`/editor/${newDoc.doc.id}`)
        } catch(error){
            console.error("Failed to create document:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-gray-900">
            {/* Elegant Top Bar */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
                        collab<span className="text-black">Docs</span>
                    </h1>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 transition hover:bg-red-100 hover:text-red-600 hover:shadow-md hover:scale-105 focus:outline-none"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Section */}
            <main className="max-w-7xl mx-auto px-6 py-12 ">
                {/* Welcome Message and Create Button */}
                <div className="flex items-center justify-between mb-10 ">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-1 ">
                            Your Documents
                        </h2>
                        <p className="text-sm text-gray-500">
                            Welcome, {user?.full_name || "User"} 👋
                        </p>
                    </div>
                    <button onClick={handleCreateNewDoc}
                    className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm shadow-md transition hover:bg-blue-700 hover:shadow-lg hover:scale-105 focus:outline-none">
                        + New Document
                    </button>
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                   {Array.isArray(documents) && documents.map((doc) => (
                     <div 
                        key={doc.id}
                        onClick={() => navigate(`/editor/${doc.id}`)}
                        className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                     >
                     <div className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {doc.doc_name}
                     </div>
                     <div>
                        <div className="text-sm text-gray-400">
                            Last edited: {new Date(doc.updated_at).toLocaleString()}
                        </div>
                     </div>

                     </div>
                   ))}
                </div>
            </main>
        </div>
    );
}



