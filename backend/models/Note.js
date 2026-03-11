const mongoose = require("mongoose");
const slugify = require("slugify");

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Tiêu đề là bắt buộc"],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  contents: {
    type: String,
    required: [true, "Nội dung là bắt buộc"],
  },
  status: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Tự động tạo slug từ title trước khi lưu
noteSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      locale: "vi",
    });
  }
});

module.exports = mongoose.model("Note", noteSchema);
