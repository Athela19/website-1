import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
import Users from "./models/UserModel.js";
import Job from "./models/Posts.js"; // Mengimpor Job setelah Users
import FileUpload from "express-fileupload"


dotenv.config();
const app = express();

// Asosiasi di sini
Users.hasMany(Job, { foreignKey: "userId", as: "userJobs" });
Job.belongsTo(Users, { foreignKey: "userId", as: "userDetails" });

// Setelah asosiasi, Anda bisa menjalankan sinkronisasi dengan database
const connectDB = async () => {
    try {
        await db.authenticate();
        console.log('Database berhasil dijalankan');
        // Sinkronisasi model dengan database
        await db.sync({ force: false }); // Gunakan 'force: true' hanya di tahap pengembangan, ini akan menghapus tabel dan membuat ulang
    } catch (error) {
        console.log('Database gagal dijalankan');
        console.error(error);
    }
};

connectDB();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(router);

app.listen(5000, () => console.log('Server berjalan di port 5000!!'));
