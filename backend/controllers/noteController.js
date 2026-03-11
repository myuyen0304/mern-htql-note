const Note = require("../models/Note");
const slugify = require("slugify");

// ============ PUBLIC ============

// GET /api/public/notes - Danh sách notes active
const getPublicNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: true })
      .select("-__v")
      .populate("created_by", "username");
    // Ẩn trường status khi public
    const result = notes.map((note) => {
      const obj = note.toObject();
      delete obj.status;
      return obj;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET /api/public/notes/:id - Chi tiết note active
const getPublicNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, status: true })
      .select("-__v")
      .populate("created_by", "username");
    if (!note) {
      return res.status(404).json({ message: "Không tìm thấy ghi chú" });
    }
    const obj = note.toObject();
    delete obj.status;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ============ PRIVATE ============

// GET /api/private/notes - Tất cả notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .select("-__v")
      .populate("created_by", "username");
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET /api/private/notes/:id - Chi tiết note
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .select("-__v")
      .populate("created_by", "username");
    if (!note) {
      return res.status(404).json({ message: "Không tìm thấy ghi chú" });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// POST /api/private/notes - Tạo note mới
const createNote = async (req, res) => {
  try {
    const { title, contents } = req.body;

    // Validate
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    }
    if (!contents || !contents.trim()) {
      return res.status(400).json({ message: "Nội dung là bắt buộc" });
    }

    // Kiểm tra title trùng
    const existingNote = await Note.findOne({ title: title.trim() });
    if (existingNote) {
      return res.status(400).json({ message: "Tiêu đề đã tồn tại" });
    }

    const note = new Note({
      title: title.trim(),
      contents: contents.trim(),
      created_by: req.user.userId, // Tự động từ JWT
    });

    await note.save();

    // Populate created_by trước khi trả về
    await note.populate("created_by", "username");

    res.status(201).json({
      message: "Tạo ghi chú thành công",
      note,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tiêu đề đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PUT /api/private/notes/:id - Cập nhật note
const updateNote = async (req, res) => {
  try {
    const { title, contents } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Không tìm thấy ghi chú" });
    }

    // Validate & update title
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Tiêu đề không được để trống" });
      }
      // Kiểm tra title trùng (trừ note này)
      const existingNote = await Note.findOne({
        title: title.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingNote) {
        return res.status(400).json({ message: "Tiêu đề đã tồn tại" });
      }
      note.title = title.trim();
      note.slug = slugify(title.trim(), {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    // Update contents
    if (contents !== undefined) {
      if (!contents.trim()) {
        return res
          .status(400)
          .json({ message: "Nội dung không được để trống" });
      }
      note.contents = contents.trim();
    }

    await note.save();
    await note.populate("created_by", "username");

    res.json({
      message: "Cập nhật ghi chú thành công",
      note,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Tiêu đề đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PATCH /api/private/notes/:id/toggle - Đổi trạng thái status
const toggleNoteStatus = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Không tìm thấy ghi chú" });
    }

    note.status = !note.status;
    await note.save();
    await note.populate("created_by", "username");

    res.json({
      message: note.status ? "Đã hiện ghi chú" : "Đã ẩn ghi chú",
      note,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getPublicNotes,
  getPublicNoteById,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  toggleNoteStatus,
};
