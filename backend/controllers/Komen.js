import Komen from "../models/Komen.js";
import Users from "../models/UserModel.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

// Get All Comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Komen.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "url"], // Ambil data user yang diperlukan
        },
      ],
    });

    // Format data komentar
    const formattedComments = comments.map((comment) => ({
      ...comment.toJSON(),
      username: comment.user.name,
      userImage: comment.user.image,
      createdAtFormatted: dayjs(comment.createdAt).fromNow(), // Format waktu relatif
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Comment
export const createComment = async (req, res) => {
    try {
      const { komentar } = req.body;
      const userId = req.user.id; // Ambil userId dari middleware autentikasi
  
      if (!komentar) {
        return res.status(400).json({ message: "Komentar tidak boleh kosong." });
      }
  
      // Cek apakah user sudah pernah berkomentar
      const existingComment = await Komen.findOne({ where: { userId } });
  
      if (existingComment) {
        return res.status(400).json({ message: "Anda hanya bisa memberikan satu komentar." });
      }
  
      // Simpan komentar ke database
      const newComment = await Komen.create({ komentar, userId });
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

// Get Comment by ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Komen.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "name", "url"],
        },
      ],
    });

    if (comment) {
      const formattedComment = {
        ...comment.toJSON(),
        username: comment.user.name,
        userImage: comment.user.image,
        createdAtRelative: dayjs(comment.createdAt).fromNow(), // Format waktu relatif
      };
      res.status(200).json(formattedComment);
    } else {
      res.status(404).json({ message: "Komentar tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Komen.findByPk(req.params.id);
    if (comment) {
      const { komentar } = req.body;

      if (!komentar) {
        return res.status(400).json({ message: "Komentar tidak boleh kosong." });
      }

      // Update komentar
      comment.komentar = komentar;
      await comment.save();
      res.status(200).json(comment);
    } else {
      res.status(404).json({ message: "Komentar tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id; // Ambil userId dari middleware autentikasi

    // Cari komentar berdasarkan id
    const comment = await Komen.findOne({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" });
    }

    // Pastikan hanya pemilik komentar yang bisa menghapus
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus komentar ini." });
    }

    // Hapus komentar
    await Komen.destroy({ where: { id: commentId } });
    res.status(200).json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};