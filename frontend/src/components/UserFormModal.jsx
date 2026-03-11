import { useState, useEffect } from "react";
import { FiX, FiSave, FiUserPlus } from "react-icons/fi";

const UserFormModal = ({ isOpen, onClose, onSubmit, user, isLoading }) => {
  const [username, setUsername] = useState("");
  const [keypass, setKeypass] = useState("");
  const [errors, setErrors] = useState({});

  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setUsername(user.username || "");
        setKeypass("");
      } else {
        setUsername("");
        setKeypass("");
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username là bắt buộc";
    if (!isEdit && !keypass.trim()) newErrors.keypass = "Mật khẩu là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = { username: username.trim() };
    if (keypass.trim()) data.keypass = keypass;

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {isEdit ? (
              <>
                <FiSave className="text-indigo-600" />
                Sửa người dùng
              </>
            ) : (
              <>
                <FiUserPlus className="text-indigo-600" />
                Thêm người dùng
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
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
                errors.username ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Nhập username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu {!isEdit && <span className="text-red-500">*</span>}
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
                errors.keypass ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder={
                isEdit ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"
              }
            />
            {errors.keypass && (
              <p className="mt-1 text-sm text-red-500">{errors.keypass}</p>
            )}
            {isEdit && (
              <p className="mt-1 text-xs text-gray-400">
                Để trống nếu không muốn thay đổi mật khẩu
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
