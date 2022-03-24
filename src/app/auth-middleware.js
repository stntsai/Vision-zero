const admin = require("firebase-admin");

module.exports = (req, res, next) => {
  const sessionCookie = req.cookies.session || "";

  if (sessionCookie === "") {
    res.redirect("/sign-in");
  } else {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then(userData => {
        console.log("Logged in:", userData.email);
        req.user = userData;
        next();
      })
      .catch(error => {
        res.redirect("/sign-in");
      });
  }
};
