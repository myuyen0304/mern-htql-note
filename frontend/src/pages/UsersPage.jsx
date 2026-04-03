import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiEyeOff, FiUsers } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import UserDetailModal from "../components/UserDetailModal";
import UserFormModal from "../components/UserFormModal";
import ConfirmModal from "../components/ConfirmModal";

const UsersPage = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [detailModal, setDetailModal] = useState({ open: false, user: null });
  const [formModal, setFormModal] = useState({ open: false, user: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAuthenticated ? "/private/users" : "/public/users";
      const response = await API.get(endpoint);
      setUsers(response.data);
    } catch (_error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xem chi tiết
  const handleView = async (userId) => {
    try {
      const endpoint = isAuthenticated
        ? `/private/users/${userId}`
        : `/public/users/${userId}`;
      const response = await API.get(endpoint);
      setDetailModal({ open: true, user: response.data });
    } catch (_error) {
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  // Tạo mới
  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      await API.post("/private/users", data);
      toast.success("Tạo người dùng thành công!");
      setFormModal({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      const message =
        error.response?.data?.message || "Tạo người dùng thất bại";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật
  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      await API.put(`/private/users/${formModal.user._id}`, data);
      toast.success("Cập nhật người dùng thành công!");
      setFormModal({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle trạng thái (Ẩn/Hiện)
  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      const response = await API.patch(
        `/private/users/${confirmModal.user._id}/toggle`,
      );
      toast.success(response.data.message);
      setConfirmModal({ open: false, user: null });
      fetchUsers();
    } catch (_error) {
      toast.error("Đổi trạng thái thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiUsers className="text-indigo-600" />
          Quản lý Người dùng
        </h1>
        {isAuthenticated && (
          <button
            onClick={() => setFormModal({ open: true, user: null })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <FiPlus size={18} />
            Thêm User
          </button>
        )}
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FiUsers className="mx-auto text-gray-300" size={48} />
          <p className="mt-4 text-gray-500">Không có người dùng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  {isAuthenticated && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    {isAuthenticated && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isactive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Không hoạt động
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(user._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
                        >
                          <FiEye size={14} />
                          Xem
                        </button>
                        {isAuthenticated && (
                          <>
                            <button
                              onClick={() => setFormModal({ open: true, user })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
                            >
                              <FiEdit2 size={14} />
                              Sửa
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({ open: true, user })
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                user.isactive
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              <FiEyeOff size={14} />
                              {user.isactive ? "Ẩn" : "Hiện"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, user: null })}
        user={detailModal.user}
        showStatus={isAuthenticated}
      />

      <UserFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, user: null })}
        onSubmit={formModal.user ? handleUpdate : handleCreate}
        user={formModal.user}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, user: null })}
        onConfirm={handleToggleStatus}
        title={
          confirmModal.user?.isactive ? "Ẩn người dùng" : "Hiện người dùng"
        }
        message={
          confirmModal.user?.isactive
            ? `Bạn có chắc chắn muốn ẩn người dùng "${confirmModal.user?.username}"?`
            : `Bạn có chắc chắn muốn hiện người dùng "${confirmModal.user?.username}"?`
        }
        isLoading={actionLoading}
      />
    </div>
  );
};

export default UsersPage;
