const express = require("express");
const server = express();
const cors = require("cors");
server.use(cors({credentials: true, origin: "http://localhost:3000" }));
const bodyParser = require("body-parser");
server.use(bodyParser.json());
const bcrypt = require("bcrypt");

const sessions = require("express-session");
const { db, User } = require("./db/db.js");
const sequelizeStore = require("connect-session-sequelize")(sessions.Store);
// (miliseconds, seconds, minutes, hours, days)
const oneWeek = 1000 * 60 * 60 * 24 * 7;
server.use (
    sessions({
        secret: "mysecretkey",
        store: new sequelizeStore({db}),
        cookie: {maxAge: oneWeek},
    })
);

let port = process.env.PORT;
if (!port) {
    port = 3001;
}


server.get("/", (req, res)=>{
    res.send({hello: "world"});
});

server.post("/login", async (req, res)=>{
    const user = await User.findOne({ where: {username: req.body.username } },
        {raw: true}
        );
    if (!user) {
        res.send({ error: "username not found" });
    } else {
        const matchingPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (matchingPassword) {
            req.session.user = user;
            res.send({ success: true, message: "open sesame" });
        } else {
            res.send({ error: "Invalid Password"});
        }
    }
});

server.get("/loginStatus", (req, res)=> {
    if(req.session.user) {
        res.send({ isLoggedIn: true});
    } else {
        res.send({ isLoggedIn: false});
    }
});

server.get("/logout", (req, res)=>{
    req.session.destroy();
    res.send({ isLoggedIn: false});
});

server.post("/newUser", async (req,res)=>{
    const existingUser = await User.findOne({where: {username: req.body.username}});
    if (existingUser){
        res.send({error: "username already taken"})
    } else {
        await User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
        })
        res.send({success: true, message: "account created"})
    }
})

server.listen(port, ()=>{
    console.log("Server running.");
});

const createFirstUser = async () => {
    const users = await User.findAll();
    if (users.length === 0) {
        User.create({
            username: "TheWatcher",
            password: bcrypt.hashSync("ThereGoesTheMultiverse", 10),
        });
    }
};

createFirstUser();

// const createNewUser = async () => {
//     const users = await User.findAll();
//     if ()
// }