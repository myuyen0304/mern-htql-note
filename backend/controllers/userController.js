const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ============ PUBLIC ============

// GET /api/public/users - Danh sách users active (ẩn keypass, ẩn isactive)
const getPublicUsers = async (req, res) => {
  try {
    const users = await User.find({ isactive: true }).select(
      "-keypass -isactive -__v",
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET /api/public/users/:id - Chi tiết user active (ẩn keypass, ẩn isactive)
const getPublicUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isactive: true,
    }).select("-keypass -isactive -__v");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ============ PRIVATE ============

// GET /api/private/users - Tất cả users (ẩn keypass)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-keypass -__v");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// GET /api/private/users/:id - Chi tiết user (ẩn keypass)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-keypass -__v");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// POST /api/private/users - Tạo user mới
const createUser = async (req, res) => {
  try {
    const { username, keypass } = req.body;

    // Validate
    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username là bắt buộc" });
    }
    if (!keypass || !keypass.trim()) {
      return res.status(400).json({ message: "Mật khẩu là bắt buộc" });
    }

    // Kiểm tra username trùng
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    const user = new User({
      username: username.trim(),
      keypass,
    });

    await user.save();

    res.status(201).json({
      message: "Tạo người dùng thành công",
      user: {
        _id: user._id,
        username: user.username,
        isactive: user.isactive,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PUT /api/private/users/:id - Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { username, keypass } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Validate username
    if (username !== undefined) {
      if (!username.trim()) {
        return res
          .status(400)
          .json({ message: "Username không được để trống" });
      }
      // Kiểm tra username trùng (trừ chính user này)
      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username đã tồn tại" });
      }
      user.username = username.trim();
    }

    // Nếu có đổi mật khẩu
    if (keypass && keypass.trim()) {
      user.keypass = keypass;
    }

    await user.save();

    res.json({
      message: "Cập nhật người dùng thành công",
      user: {
        _id: user._id,
        username: user.username,
        isactive: user.isactive,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// PATCH /api/private/users/:id/toggle - Đổi trạng thái isactive
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.isactive = !user.isactive;
    await user.save();

    res.json({
      message: user.isactive ? "Đã kích hoạt người dùng" : "Đã ẩn người dùng",
      user: {
        _id: user._id,
        username: user.username,
        isactive: user.isactive,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getPublicUsers,
  getPublicUserById,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
};
