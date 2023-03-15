const router = require("express").Router();
const { isAuthenticated, isAdmin, isUser } = require("../middleware/auth");
const orderController = require("../controllers/orderController");

router.route("/").get(isAuthenticated, isAdmin, orderController.getOrders);
router.route("/").post(isAuthenticated, isUser, orderController.createOrder);
router.route("/myorders").get(isAuthenticated, isUser, orderController.getMyOrders);
router.route("/:id").get(isAuthenticated, orderController.getOrder);
router.route('/:id').put(isAuthenticated, isAdmin, orderController.updateOrder);
router.route('/:id').delete(isAuthenticated, isAdmin, orderController.deleteOrder);

module.exports = router;