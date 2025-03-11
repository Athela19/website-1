import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "name", "email"],
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Terjadi kesalahan saat mendapatkan data users" });
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confpassword } = req.body;
  if (password !== confpassword) {
    return res
      .status(400)
      .json({ msg: "Password and password confirmation are different." });
  }

  try {
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email has registered." });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await Users.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    res.json({ msg: "Registration successful!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ msg: "Error during registration" });
  }
};

export const Login = async (req, res) => {
  console.log("Received login request:", req.body);

  try {
    const users = await Users.findAll({
      where: {
        email: req.body.email,
      },
    });

    if (users.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = users[0];
    const userid = user.id;
    const name = user.name;
    const email = user.email;

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Password is wrong." });
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret || !refreshTokenSecret) {
      return res.status(500).json({ msg: "Server error: missing secret keys" });
    }

    const accessToken = jwt.sign({ userid, name, email }, accessTokenSecret, {
      expiresIn: "1800s",
    });

    const refreshToken = jwt.sign({ userid, name, email }, refreshTokenSecret, {
      expiresIn: "1d",
    });

    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userid,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "There was an error while logging in" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

export const deleteAccount = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user[0]) return res.status(404).json({ msg: "User not found" });
    const userId = user[0].id;

    await Users.destroy({
      where: {
        id: userId,
      },
    });

    res.clearCookie("refreshToken");
    return res.status(200).json({ msg: "Account successfully deleted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "There was an error while deleting the account" });
  }
};

export const getProfil = async (req, res) => {
  try {
    const response = await Users.findAll();
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getProfilbyId = async (req, res) => {
  try {
    const response = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const saveProfil = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name).toLowerCase();
  const fileName = `${file.md5}${ext}`;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];
  
  if (!allowedType.includes(ext)) {
      return res.status(422).json({ msg: "Invalid image format" });
    }
    
    if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5MB" });
    }
    
  const uploadPath = `./public/images/${fileName}`;

  file.mv(uploadPath, async (err) => {
      if (err) {
          return res.status(500).json({ msg: "File upload failed" });
        }
        
        try {
            await Users.create({
                name: name,
                email: email,
                password: password,
                image: fileName,
                url: url,
                creatadd: new Date(),
            });
            
            res.status(201).json({ msg: "Profile saved successfully" });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ msg: "Database error" });
        }
    });
};


export const updateProfil = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { name, email, password } = req.body; // Ambil data dari body request

  // Validasi ID
  if (!id) {
    return res.status(400).json({ msg: "ID tidak valid" });
  }

  try {
    // Cari profil berdasarkan ID
    const profil = await Users.findOne({
      where: {
        id: id,
      },
    });

    // Jika profil tidak ditemukan
    if (!profil) {
      return res.status(404).json({ msg: "Profil tidak ditemukan" });
    }

    let fileName = profil.image; // Default: gunakan gambar lama
    let url = profil.url; // Default: gunakan URL lama

    // Jika ada file yang diunggah
    if (req.files && req.files.file) {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name).toLowerCase();
      fileName = `${file.md5}${ext}`; // Generate nama file baru
      const allowedType = [".png", ".jpg", ".jpeg"];

      // Validasi tipe file
      if (!allowedType.includes(ext)) {
        return res.status(422).json({ msg: "Format gambar tidak valid. Hanya PNG, JPG, dan JPEG yang diperbolehkan." });
      }

      // Validasi ukuran file
      if (fileSize > 5000000) { // 5MB
        return res.status(422).json({ msg: "Ukuran gambar harus kurang dari 5MB" });
      }

      // Hapus file lama jika ada
      if (profil.image) {
        const filepath = `./public/images/${profil.image}`;
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath); // Hapus file lama dari direktori
        }
      }

      // Pastikan direktori ./public/images/ ada
      if (!fs.existsSync('./public/images')) {
        fs.mkdirSync('./public/images', { recursive: true });
      }

      // Pindahkan file baru ke direktori
      const uploadPath = `./public/images/${fileName}`;
      await file.mv(uploadPath, (err) => {
        if (err) {
          console.error("Gagal memindahkan file:", err);
          return res.status(500).json({ msg: "Gagal mengunggah file" });
        }
      });

      // Update URL
      url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    }

    // Hash password jika diupdate
    let hashedPassword = profil.password; // Default: gunakan password lama
    if (password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Update data profil di database
    await Users.update(
      {
        name: name,
        email: email,
        password: hashedPassword, // Gunakan password yang sudah dihash
        image: fileName,
        url: url,
      },
      {
        where: {
          id: id,
        },
      }
    );

    // Kirim respons sukses
    res.status(200).json({ msg: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error saat memperbarui profil:", error.message);

    // Kirim respons error ke client
    res.status(500).json({ msg: "Terjadi kesalahan saat memperbarui profil" });
  }
};

export const deleteProfil = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  // Validasi ID
  if (!id) {
    return res.status(400).json({ msg: "ID tidak valid" });
  }

  try {
    // Cari profil berdasarkan ID
    const profil = await Users.findOne({
      where: {
        id: id,
      },
    });

    // Jika profil tidak ditemukan
    if (!profil) {
      return res.status(404).json({ msg: "Profil tidak ditemukan" });
    }

    // Hapus file gambar jika ada
    if (profil.image) {
      const filepath = `./public/images/${profil.image}`;

      // Periksa apakah file ada sebelum menghapus
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath); // Hapus file dari direktori
      } else {
        console.log(
          "File gambar tidak ditemukan, melanjutkan penghapusan data..."
        );
      }
    }

    // Hapus data dari database
    await Users.destroy({
      where: {
        id: id,
      },
    });

    // Kirim respons sukses
    res.status(200).json({ msg: "Profil berhasil dihapus" });
  } catch (error) {
    console.error("Error saat menghapus profil:", error.message);

    // Kirim respons error ke client
    res.status(500).json({ msg: "Terjadi kesalahan saat menghapus profil" });
  }
};
