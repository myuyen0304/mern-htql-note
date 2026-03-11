import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FiLogIn } from "react-icons/fi";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [keypass, setKeypass] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập, redirect về trang chính
  if (isAuthenticated) {
    navigate("/users", { replace: true });
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Vui lòng nhập username";
    if (!keypass.trim()) newErrors.keypass = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(username.trim(), keypass);
      toast.success("Đăng nhập thành công!");
      navigate("/users", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <FiLogIn className="text-indigo-600" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
            <p className="text-gray-500 text-sm mt-1">
              Nhập thông tin để truy cập hệ thống
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username)
                    setErrors((prev) => ({ ...prev, username: "" }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.username
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Nhập username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={keypass}
                onChange={(e) => {
                  setKeypass(e.target.value);
                  if (errors.keypass)
                    setErrors((prev) => ({ ...prev, keypass: "" }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.keypass
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Nhập mật khẩu"
              />
              {errors.keypass && (
                <p className="mt-1 text-sm text-red-500">{errors.keypass}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
