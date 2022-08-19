const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");


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

const createFirstUser = async () => {
    const users = await User.findAll();
    if (users.length === 0) {
        User.create({
            username: "TheWatcher",
            password: bcrypt.hashSync("ThereGoesTheMultiverse", 10),
        });
    }
};

const db = new Sequelize(databaseURL, options);

const User = require("./User")(db);

const connectToDB = async ()=>{
    try{
        await db.authenticate();
        console.log("Connected successfully.");
        await db.sync();
        createFirstUser();
    } catch (error) {
        console.error(error);
        console.error("Invalid username and/or password.");
    }
};

connectToDB();

module.exports = { db, User };