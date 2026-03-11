import {
  FiX,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const UserDetailModal = ({ isOpen, onClose, user, showStatus }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-indigo-600" />
            Chi tiết người dùng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <FiUser className="text-indigo-600" size={28} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">
                {user.username}
              </h4>
              <p className="text-sm text-gray-500">ID: {user._id}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-gray-400" />
              <span className="text-gray-500">Ngày tạo:</span>
              <span className="text-gray-800 font-medium">
                {new Date(user.created_at).toLocaleString("vi-VN")}
              </span>
            </div>

            {showStatus && (
              <div className="flex items-center gap-2 text-sm">
                {user.isactive ? (
                  <>
                    <FiCheckCircle className="text-green-500" />
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Hoạt động
                    </span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="text-red-500" />
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Không hoạt động
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
