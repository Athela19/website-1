import Job from "../models/Posts.js"; // Pastikan model 'Posts' sudah memiliki kolom 'noWa'
import { verifyToken } from "../middleware/VerifyToken.js"; // jika menggunakan JWT
import Users from "../models/UserModel.js"; 
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

// Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["name"],
        },
      ],
    });

    const formattedJobs = jobs.map((job) => ({
      ...job.toJSON(),
      username: job.user.name,
      createdAtFormatted: dayjs(job.createdAt).fromNow(), // Format waktu relatif
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const { pekerjaan, deskripsi, alamat, noWa , harga} = req.body;

    // Pastikan userId sudah ada di req.user yang telah diset di middleware
    const userId = req.user.id;  // Mengambil userId dari req.user

    if (!pekerjaan || !deskripsi || !alamat || !harga) {
      return res.status(400).json({ message: "All field must be filled." });
    }

    // Simpan pekerjaan ke database
    const newJob = await Job.create({ pekerjaan, deskripsi, alamat, noWa, userId , harga});
    res.status(201).json(newJob);  // Kirim respons dengan pekerjaan yang baru dibuat
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["name"],
        },
      ],
    });

    if (job) {
      const formattedJob = {
        ...job.toJSON(),
        username: job.user.name,
        createdAtRelative: dayjs(job.createdAt).fromNow(), // Tambahkan waktu relatif
      };
      res.status(200).json(formattedJob);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Update Job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id); // Ambil pekerjaan berdasarkan ID
    if (job) {
      const { pekerjaan, deskripsi, alamat, noWa } = req.body; // Ambil data dari request body

      // Validasi data jika diperlukan
      if (!pekerjaan || !deskripsi || !alamat || !noWa) {
        return res.status(400).json({ message: "All field must be filled." });
      }

      // Update field
      job.pekerjaan = pekerjaan;
      job.deskripsi = deskripsi;
      job.alamat = alamat;
      job.noWa = noWa; // Perbarui nomor WhatsApp
      await job.save(); // Simpan perubahan
      res.status(200).json(job); // Kembalikan data yang diperbarui
    } else {
      res.status(404).json({ message: "Job not found" }); // Jika tidak ditemukan
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); // Tangani error
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;  // id pekerjaan yang akan dihapus
    const userId = req.user.id;   // id user dari token yang didekodekan (gunakan middleware verifyToken)

    // Cari pekerjaan berdasarkan id dan userId
    const job = await Job.findOne({ where: { id: jobId } });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.userId !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this job" });
    }

    // Hapus pekerjaan jika userId sama
    await Job.destroy({ where: { id: jobId } });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
