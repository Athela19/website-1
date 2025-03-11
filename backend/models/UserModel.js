import { DataTypes, Sequelize } from "sequelize";
import db from "../config/Database.js";

const Users = db.define('Users',{
    name:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING
    },
    password:{
        type:DataTypes.STRING
    },
    image:{
        type:DataTypes.STRING,
        allowNull: true, 
    },
    url:{
        type:DataTypes.STRING,
        allowNull: true, 
    },
    refresh_token:{
        type:DataTypes.TEXT
    },
},{
    freezeTableName:true
});

export default Users;
