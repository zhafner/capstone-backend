const Sequelize = require("sequelize");

const db = new Sequelize("postgres://zacharyhafner@localhost:5432/users");
const User = require("./User")(db);

const connectToDB = async ()=>{
    try{
        await db.authenticate();
        console.log("Connected successfully.");
        db.sync();
    } catch (error) {
        console.error(error);
        console.error("Invalid username and/or password.");
    }
};

connectToDB();

module.exports = { db, User };