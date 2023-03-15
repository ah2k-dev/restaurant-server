const router = require("express").Router();
const { isAuthenticated, isAdmin, isUser } = require("../middleware/auth");
const productController = require("../controllers/productController");

router.route("/").get(productController.getProducts);
router.route("/").post(isAuthenticated, isAdmin, productController.createProduct);
router.route("/:id").get(productController.getProduct);
router.route("/:id").put(isAuthenticated, isAdmin, productController.updateProduct);
router.route("/:id").delete(isAuthenticated, isAdmin, productController.deleteProduct);

module.exports = router