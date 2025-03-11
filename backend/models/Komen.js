import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js";
import Users from "./UserModel.js";

const Komen = sequelize.define(
  "Komentar", // Nama model disesuaikan dengan nama tabel
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    komentar: {
      type: DataTypes.TEXT,
      allowNull: false, // Pastikan komentar tidak boleh kosong
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Pastikan userId tidak boleh kosong
    },
  },
  {
    tableName: "Komentar", // Nama tabel di database
    timestamps: true, // Otomatis membuat createdAt dan updatedAt
  }
);

// Definisikan relasi dengan model Users
Komen.belongsTo(Users, { foreignKey: "userId", as: "user" });

export default Komen;