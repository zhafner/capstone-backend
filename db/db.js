const Sequelize = require("sequelize");

let databaseURL = process.env.DATABASE_URL;
let options = {};
// if running database on localhost
if (!databaseURL) {
    // set databaseURL to the localhost database URL
    databaseURL = "postgres://zacharyhafner@localhost:5432/users";
    // set options for database running on localhost
    options = {
        // set logging to false
        logging: false,
    };
} else {
    // set options for database running on heroku
    options.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    };
}
// initialize an instance of Sequelize to connect to the database
// passing the URI options as arguments
const db = new Sequelize(databaseURL, options);

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