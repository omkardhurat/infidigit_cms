function isLoggedIn(req, res, next) {
  console.log("session check");
  if (req.session && req.session.user) {
    console.log("session in");
    next(); // Allow access to the route if logged in
  } else {
    console.log("ses out");
    return res.redirect(`/?error=Session Timeout`);
  }
}

module.exports = {
    isLoggedIn 
}
