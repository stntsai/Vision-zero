const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const app = express();
const port = process.env.PORT || 8000;
const serviceAccount = require("../config/serviceAccountKey.json");
const authMiddleware = require("./app/auth-middleware");
const checkoutRoutes = require('./app/checkout-routes');
const UserService = require('./app/user-service');

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


app.get("/", authMiddleware, async function (req, res) {
    res.render("pages/index", {user: req.user});
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/planner", authMiddleware, async function (req, res) {
  res.render("pages/planner", { user: req.user });
});

app.get("/route", authMiddleware, async function (req, res) {
  res.render("pages/route", { user: req.user });
});

app.get("/donate", authMiddleware, async function (req, res) {
  res.render("pages/donate", { user: req.user });
});

app.get("/profile-setting", authMiddleware, async function (req, res) {
  res.render("pages/user-profile-setting", { user: req.user });
});

app.get("/user-profile", authMiddleware, async function (req, res) {
  res.render("pages/user-profile", { user: req.user });
});


// app.get("/user-profile", async function (req, res) {
//   res.render("pages/user-profile", { user: req.user });
// });

// app.get("/profile-setting", async function (req, res) {
//   res.render("pages/user-profile-setting", { user: req.user });
// });

// app.post("/sessionLogin", authMiddleware, async (req, res) => {
//   const idToken = req.body.idToken.toString();
//   const signInType = req.body.signInType;

//   // Set session expiration to 5 days.
//   const expiresIn = 60*60*24*5*1000;

//   admin.auth()
//     .createSessionCookie(idToken, { expiresIn })
//     .then(
//       (sessionCookie) => {
//         // Set cookie policy for session cookie.
//         const options = { maxAge: expiresIn, httpOnly: true, secure: true };
//         res.cookie('__session', sessionCookie, options);

//         admin.auth()
//           .verifySessionCookie(sessionCookie, true /** checkRevoked */)
//           .then(userData => {
//             console.log("Logged in:", userData.email);
            
//             // save id to firebase
//             const id = userData.sub;
//             const email = userData.email;
//             if(signInType =='register'){
//               //save to firebase
//               UserService.createUser(id,email)
//             }

//             res.end(JSON.stringify({ status: 'success'}));
//             res.status(200).send();
//           })
        
//       },
//       (error) => {
//         console.log(error)
//         res.status(401).send('UNAUTHORIZED REQUEST!');
//       }
//     );
// });



app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken.toString();

  // Set session expiration to 5 days.
  const expiresIn = 60*60*24*5*1000;

  admin.auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie('__session', sessionCookie, options);
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

// save profile data to firestore

app.post('/addProfile', async function(req, res){

  // console.log(req.body)
  const db = admin.firestore();

  UserService.createUserProfile(db, req.body.email, req.body.firstName, req.body.lastName, req.body.preferedMode);
  
  const user = await UserService.getUserByEmail(db,req.body.email);
  const user_info = req.body
  console.log(user_info)
  // res.render("pages/user-profile-setting")
  res.render("pages/user-profile", {user_info:user_info});
  // res.send("")
});

checkoutRoutes(app);
exports.app = functions.https.onRequest(app);

// app.listen(port);
// console.log("Server started at http://localhost:" + port);




