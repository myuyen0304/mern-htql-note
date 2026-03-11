const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username là bắt buộc"],
    unique: true,
    trim: true,
  },
  keypass: {
    type: String,
    required: [true, "Mật khẩu là bắt buộc"],
  },
  isactive: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Hash password trước khi lưu
userSchema.pre("save", async function () {
  if (!this.isModified("keypass")) return;
  const salt = await bcrypt.genSalt(10);
  this.keypass = await bcrypt.hash(this.keypass, salt);
});

// So sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.keypass);
};

module.exports = mongoose.model("User", userSchema);
