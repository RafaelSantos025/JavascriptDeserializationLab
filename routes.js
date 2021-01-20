const express = require("express");
const routes = express.Router();
const crypto = require("crypto");
var serialize = require('node-serialize');

const user_db = {"username":"admin", "password":crypto.randomBytes(64).toString("hex"), "cookie": crypto.randomBytes(128).toString("hex")}

function checkCredentials(body){
    var credentials = serialize.unserialize(body);
    var username = credentials.username;
    var password = credentials.password;

    if (user_db.username === username && user_db.password === password){
            return user_db.cookie;
    }
    return false;
}

function checkLogin(req){
    if (getCookie(req) === user_db.cookie){
            return true;
    }else{
        return false;
    }
}

function getCookie(req){
    if(req.headers.cookie && req.headers.cookie.includes("=")){
        return req.headers.cookie.split("=")[1]
    }
}

routes.post("/login", (req, res) => {

    var cookie = checkCredentials(req.body);
    if (cookie != false){
        res.cookie("admin_session", cookie,  { maxAge: 900000});
        return res.status(200).redirect("/admin");
    }else{
        return res.redirect("/login");
    }
});

routes.get("/admin", (req, res) => {
    var isLogedin = checkLogin(req)

    if (isLogedin){
        return res.sendFile("./htmls/admin.html", {root:__dirname});
    }
    return res.status(401).send("Forbidden");
});

routes.get("/login", (req, res) => {
    return res.status(200).sendFile("./htmls/login.html", {root:__dirname});
});

routes.get("/css/login.css", (req, res) => {
    return res.status(200).sendFile("./css/login.css", {root: __dirname});
});



routes.get("/*", (req, res) => {
    return res.redirect("/login");
});

module.exports = routes;