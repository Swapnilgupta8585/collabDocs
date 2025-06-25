import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute"
import { Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import EditorPageCollab from "./pages/EditorPageCollab"
import EditorViewPage from "./pages/EditorViewPage";


function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public landing at “/” */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          


          {/*Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor/:docId" element={<EditorPage />} />
            <Route path="/edit/:token" element={<EditorPageCollab />} />
             <Route path="/view/:token" element={<EditorViewPage />} />
          </Route>


          {/* Redirect to login by default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App



