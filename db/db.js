const Sequelize = require("sequelize");


let options = {};
let databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
	// this means we're on localhost!
	databaseURL = "postgres://zacharyhafner@localhost:5432/users";
	options = {
		logging: false,
	};
} else {
	// we're not on localhost
	options = {
		logging: false,
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false
			}
		}
	};
}

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