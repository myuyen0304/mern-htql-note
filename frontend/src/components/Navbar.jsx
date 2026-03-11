import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogIn, FiLogOut, FiUsers, FiFileText } from "react-icons/fi";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/users");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-indigo-700 text-white"
      : "text-indigo-100 hover:bg-indigo-500 hover:text-white";

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Nav Links */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white font-bold text-xl tracking-wide">
              📝 MERN HTQL
            </Link>
            <div className="flex space-x-2 ml-6">
              <Link
                to="/users"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/users")}`}
              >
                <FiUsers size={16} />
                Người dùng
              </Link>
              <Link
                to="/notes"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/notes")}`}
              >
                <FiFileText size={16} />
                Ghi chú
              </Link>
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-indigo-100 text-sm">
                  Xin chào,{" "}
                  <strong className="text-white">{user?.username}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  <FiLogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <FiLogIn size={16} />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
