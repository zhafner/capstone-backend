const express = require("express");
const server = express();
const cors = require("cors");
//server.use(cors({credentials: true, origin: "http://localhost:3000" }));
server.use(cors({credentials: true, origin: ["https://zhafner-capstone-frontend.herokuapp.com", "http://localhost:3000"] }));
const bodyParser = require("body-parser");
server.use(bodyParser.json());
const bcrypt = require("bcrypt");

let apiKey;
if (process.env.SENDGRID_API_KEY){
    apiKey = process.env.SENDGRID_API_KEY
} else {
 apiKey = require("./sendnewgridAPIkey");
}
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(apiKey);

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

server.post("/forgotPassword", async(req,res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
        const { nanoid } = await import("nanoid");


        user.passwordResetToken = nanoid();
        await user.save();

        const url = process.env.DATABASE_URL
            ? "https://zhafner-capstone-frontend.herokuapp.com"
            : "http://localhost:3000";

        const msg = {
            to: user.email,
            from: "zhafner1@gmail.com",
            subject: "You needed a reset, huh?",
            html: `Click <a href="${url}setPassword?token=${user.passwordResetToken}">here</a> to reset your password.`,
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body);
            }
        }
        //reset password here
        res.send({ message: "Password is ready to be reset. Go check your email."});
    } else {
    res.send({ error: "You don't have an account to reset a password on." });
    }
});

server.post('/setPassword', async (req, res)=> {
    const user = await User.findOne({where: {passwordResetToken:req.body.token} });
    if(user){
        //set the password
        user.password = bcrypt.hashSync(req.body.password, 10),
        user.passwordResetToken = null;
        await user.save();
        res.send({ success: true });
    } else {
        res.send({ error: "You don't have an account to reset a password on."});
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
            email: req.body.email,
        })
        res.send({success: true, message: "account created"})
    }
})

server.get("/search/:query", async (req, res)=>{
    const search= (await import("./fetch.mjs")).default;
    res.send({results: await search(req.params.query)})
})



server.get("/providers/:id", async (req, res)=>{
    const providers = (await import("./fetch.mjs")).providers;
    res.send({results: await providers(req.params.id)})
})

// make another endpoint to get streaming services using a new function in the fetch.mjs file

server.listen(process.env.PORT || 3001, ()=>{
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