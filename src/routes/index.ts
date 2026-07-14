import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import storeRoutes from "./store.routes";
import stockRoutes from "./stock.routes";


const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/stores", storeRoutes);
router.use("/stocks", stockRoutes);


export default router;