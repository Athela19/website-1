import { DataTypes } from "sequelize";
import sequelize from "../config/Database.js";
import Users from "./UserModel.js";

const Job = sequelize.define(
  "Posts", 
  {
    pekerjaan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
    alamat: {
      type: DataTypes.STRING,
    },
    harga: {
      type: DataTypes.STRING,
    },
    noWa: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Posts",
    timestamps: true,
  }
);

Job.belongsTo(Users, { foreignKey: "userId", as: "user" });

export default Job;
