import express from "express";
const router = express.Router();

import { capturePayment, verifyPayment, sendPaymentSuccessEmail } from ("../controllers/Payments")
import { auth, isInstructor, isStudent, isAdmin } from ("../middlewares/auth")

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

export default router;