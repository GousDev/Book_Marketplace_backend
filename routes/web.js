import express from "express";
import userController from "./../controllers/userController.js";
import siteController from "../controllers/siteController.js";
const router = express.Router();

//signup
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.get("/getUserData/:id", userController.getUserData);

// ----------------------For adminpanel--------------------
//checkfor authentication route
router.get("/checkforauth", userController.checkForAuth);
router.get("/checkandresetauth", userController.checkAndResetAuth);
router.get("/get-all", siteController.getAllBooks);
router.delete("/delete-book", siteController.deleteBook);
router.get("/get-serched-books", siteController.getSearchedBooks);
router.get("/get-serched-user", siteController.getSearchedUser);
router.get("/get-all-users", siteController.getAllUsers);
router.delete("/delete-user", siteController.deleteUser);
router.post("/add-user", siteController.addUser);
router.put("/change-role", siteController.changeRole);

// ------------------------for Frontend------------------

router.post("/upload-books", siteController.uploadBooks);
router.post("/upload-userdetail", siteController.uploadUserDetail);
router.post("/upload-userpic", siteController.uploadUserPic);
router.get("/get-storyBooks", siteController.getStoryBooks);
router.get("/get-collegeBooks", siteController.getCollegeBooks);
router.get("/get-historyBooks", siteController.getHistoryBooks);
router.get("/get-religiousBooks", siteController.getReligiousBooks);
router.get("/get-wishBooks", siteController.getWishBooks);
router.get("/catalogue", siteController.catalogue);
router.get("/getOrders/:id", siteController.getOrders);
router.get("/getOrderProducts", siteController.getOrderProducts);
//get cart Items
router.post("/getCart-books", siteController.getCartBooks);
router.post("/wishlist", siteController.wishlist);
router.post("/newOrder", siteController.newOrder);

// ----------------------payment routes-------------------
//For token

export default router;
