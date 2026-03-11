const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Note = require("./models/Note");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Note.deleteMany({});
    console.log("Đã xóa dữ liệu cũ");

    // Tạo users
    const admin = new User({
      username: "admin",
      keypass: "123456",
      isactive: true,
    });
    await admin.save();

    const user2 = new User({
      username: "nguyenvana",
      keypass: "123456",
      isactive: true,
    });
    await user2.save();

    const user3 = new User({
      username: "tranthib",
      keypass: "123456",
      isactive: false,
    });
    await user3.save();

    console.log("Đã tạo 3 users: admin, nguyenvana, tranthib");

    // Tạo notes
    const notes = [
      {
        title: "Hướng dẫn sử dụng React",
        contents:
          "React là một thư viện JavaScript phổ biến để xây dựng giao diện người dùng. React sử dụng Virtual DOM để tối ưu hiệu suất render.",
        status: true,
        created_by: admin._id,
      },
      {
        title: "Giới thiệu MongoDB",
        contents:
          "MongoDB là một hệ quản trị cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dưới dạng document JSON. MongoDB hỗ trợ mở rộng ngang và truy vấn linh hoạt.",
        status: true,
        created_by: admin._id,
      },
      {
        title: "Node.js cơ bản",
        contents:
          "Node.js là môi trường runtime JavaScript phía server, được xây dựng trên V8 engine của Chrome. Node.js hỗ trợ I/O không đồng bộ.",
        status: true,
        created_by: user2._id,
      },
      {
        title: "Express.js Framework",
        contents:
          "Express.js là framework web nhỏ gọn và linh hoạt cho Node.js, cung cấp các tính năng mạnh mẽ để phát triển ứng dụng web và API.",
        status: false,
        created_by: user2._id,
      },
      {
        title: "JWT Authentication",
        contents:
          "JSON Web Token (JWT) là một tiêu chuẩn mở để truyền thông tin an toàn giữa các bên dưới dạng JSON object. JWT thường được dùng cho xác thực.",
        status: true,
        created_by: admin._id,
      },
    ];

    for (const noteData of notes) {
      const note = new Note(noteData);
      await note.save();
    }

    console.log("Đã tạo 5 notes mẫu");
    console.log("\n=== SEED HOÀN TẤT ===");
    console.log("Đăng nhập với: username: admin, password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("Lỗi seed:", error.message);
    process.exit(1);
  }
};

seedDB();
