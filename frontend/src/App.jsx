import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import NotesPage from "./pages/NotesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/notes" element={<NotesPage />} />
            </Routes>
          </main>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
