const authorizeRoles = (...roles) => {
   return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
         return res.status(403).json({ message: "Access denied." });
      }
      next();
   };
};

module.exports = authorizeRoles;

// const authorizeRoles = require("../middlewares/authorizeRoles");
// // Chỉ cho phép người có role "admin" truy cập
// router.get("/admin/dashboard", checkLoginByCookie, authorizeRoles("admin"), (req, res) => {
//    res.json({ message: "Welcome admin!" });
// });

// // Cho phép cả "admin" và "consultant" truy cập
// router.get("/livechat", checkLoginByCookie, authorizeRoles("admin", "consultant"), (req, res) => {
//    res.json({ message: "Livechat access granted!" });
// });