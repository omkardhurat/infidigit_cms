let authenticate = (req, res, next) => {
    console.log(`Incoming req authenticate ${req.url}`);
    next()
}

module.exports = {
    authenticate 
}
