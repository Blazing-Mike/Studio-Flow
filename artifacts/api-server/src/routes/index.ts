import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studioflowRouter from "./studioflow";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studioflowRouter);

export default router;
