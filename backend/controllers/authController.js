const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, keypass } = req.body;

    // Validate đầu vào
    if (!username || !keypass) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ username và mật khẩu" });
    }

    // Tìm user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Username không tồn tại" });
    }

    // Kiểm tra trạng thái hoạt động
    if (!user.isactive) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
    }

    // So sánh mật khẩu
    const isMatch = await user.comparePassword(keypass);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
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

module.exports = { login };
