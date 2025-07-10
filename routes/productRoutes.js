const express = require("express");
const multer = require("multer");
const path = require("path");
const { body } = require("express-validator");

const productController = require("../controllers/productController");
const { handleValidation } = require("../middlewares/validateNewProduct");
const authorizeRoles = require("../middlewares/checkRole");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "public/images");
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
   },
});
const upload = multer({ storage });

// Validator setup
const validateNewProduct = [
   body("name").notEmpty().withMessage("Product name is required"),
   body("category").notEmpty().withMessage("Category is required"),
   body("short_desc").notEmpty().withMessage("Short description is required"),
   body("long_desc").notEmpty().withMessage("Long description is required"),
   body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number"),
];

router.get("/", productController.getAllProducts);
router.post(
   "/",
   upload.array("images", 4),
   validateNewProduct,
   handleValidation,
   productController.postAddProduct
);
router.get("/pagination", productController.getPaginatedProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", authorizeRoles("admin"), upload.none(), productController.updateProduct);
router.delete("/:id", authorizeRoles("admin"), productController.deleteProduct);

module.exports = router;
