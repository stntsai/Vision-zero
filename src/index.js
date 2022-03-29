const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const app = express();
const port = process.env.PORT || 8080;

const serviceAccount = require("../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/planner", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/planner", { user: req.user, feed });
});

app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken.toString();

  // Set session expiration to 5 days.
  const expiresIn = 60*60*24*5*1000;

  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin.auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('session', sessionCookie, options);
        res.end(JSON.stringify({ status: 'success' }));
        res.status(200).send();
      },
      (error) => {
        console.log(error)
        res.status(401).send('UNAUTHORIZED REQUEST!');
      }
    );
});


app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  const message = req.body.message;
  const user = req.user;
  userFeed.add(user, message)
    .then(()=>{
      userFeed.get()
        .then((feed)=>{
        res.render("pages/planner", {user: user, feed});
      })
    });
});

// app.listen(port);
// console.log("Server started at http://localhost:" + port);


exports.app = functions.https.onRequest(app);
