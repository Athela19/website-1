import express from "express";
import {
  getUsers,
  Register,
  Login,
  Logout,
  deleteAccount,
  getProfil,
  getProfilbyId,
  saveProfil,
  updateProfil,
  deleteProfil,
} from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/PostsController.js"; // Ubah ke named import
import {
  getAllComments,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/Komen.js"
const router = express.Router();

//auth
router.get("/users", verifyToken, getUsers);
router.post("/users", Register);
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);
router.delete("/delete", deleteAccount);

// Get and Give
router.post("/give",verifyToken, createJob);
router.get("/get", getAllJobs);
router.get("/give/:id", getJobById);
router.put("/update/:id", updateJob);
router.delete("/delete/:id",verifyToken, deleteJob);

//profil
router.get("/profile", getProfil)
router.get("/profile/:id", getProfilbyId)
router.post("/profile", saveProfil)
router.patch("/profile/:id", updateProfil)
router.delete("/profile/:id", deleteProfil)

router.get("/comments", getAllComments);
router.post("/comments", verifyToken, createComment);
router.get("/comments/:id", getCommentById);
router.put("/comments/:id", verifyToken, updateComment);
router.delete("/comments/:id", verifyToken, deleteComment);
export default router;
