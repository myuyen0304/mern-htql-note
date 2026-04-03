import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEye, FiEdit2, FiEyeOff, FiFileText } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import NoteDetailModal from "../components/NoteDetailModal";
import NoteFormModal from "../components/NoteFormModal";
import ConfirmModal from "../components/ConfirmModal";

const NotesPage = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [detailModal, setDetailModal] = useState({ open: false, note: null });
  const [formModal, setFormModal] = useState({ open: false, note: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, note: null });

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAuthenticated ? "/private/notes" : "/public/notes";
      const response = await API.get(endpoint);
      setNotes(response.data);
    } catch (_error) {
      toast.error("Không thể tải danh sách ghi chú");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Xem chi tiết
  const handleView = async (noteId) => {
    try {
      const endpoint = isAuthenticated
        ? `/private/notes/${noteId}`
        : `/public/notes/${noteId}`;
      const response = await API.get(endpoint);
      setDetailModal({ open: true, note: response.data });
    } catch (_error) {
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  // Tạo mới
  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      await API.post("/private/notes", data);
      toast.success("Tạo ghi chú thành công!");
      setFormModal({ open: false, note: null });
      fetchNotes();
    } catch (error) {
      const message = error.response?.data?.message || "Tạo ghi chú thất bại";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật
  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      await API.put(`/private/notes/${formModal.note._id}`, data);
      toast.success("Cập nhật ghi chú thành công!");
      setFormModal({ open: false, note: null });
      fetchNotes();
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
        `/private/notes/${confirmModal.note._id}/toggle`,
      );
      toast.success(response.data.message);
      setConfirmModal({ open: false, note: null });
      fetchNotes();
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
          <FiFileText className="text-indigo-600" />
          Quản lý Ghi chú
        </h1>
        {isAuthenticated && (
          <button
            onClick={() => setFormModal({ open: true, note: null })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <FiPlus size={18} />
            Thêm Ghi chú
          </button>
        )}
      </div>

      {/* Table */}
      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FiFileText className="mx-auto text-gray-300" size={48} />
          <p className="mt-4 text-gray-500">Không có ghi chú nào</p>
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
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Người tạo
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
                {notes.map((note, index) => (
                  <tr
                    key={note._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-800">
                        {note.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {note.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {note.created_by?.username || "N/A"}
                    </td>
                    {isAuthenticated && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {note.status ? (
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
                          onClick={() => handleView(note._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
                        >
                          <FiEye size={14} />
                          Xem
                        </button>
                        {isAuthenticated && (
                          <>
                            <button
                              onClick={() => setFormModal({ open: true, note })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
                            >
                              <FiEdit2 size={14} />
                              Sửa
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({ open: true, note })
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                note.status
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              <FiEyeOff size={14} />
                              {note.status ? "Ẩn" : "Hiện"}
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
      <NoteDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, note: null })}
        note={detailModal.note}
        showStatus={isAuthenticated}
      />

      <NoteFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, note: null })}
        onSubmit={formModal.note ? handleUpdate : handleCreate}
        note={formModal.note}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, note: null })}
        onConfirm={handleToggleStatus}
        title={confirmModal.note?.status ? "Ẩn ghi chú" : "Hiện ghi chú"}
        message={
          confirmModal.note?.status
            ? `Bạn có chắc chắn muốn ẩn ghi chú "${confirmModal.note?.title}"?`
            : `Bạn có chắc chắn muốn hiện ghi chú "${confirmModal.note?.title}"?`
        }
        isLoading={actionLoading}
      />
    </div>
  );
};

export default NotesPage;
