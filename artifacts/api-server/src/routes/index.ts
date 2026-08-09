import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobProposalsRouter from "./job-proposals";
import studioflowRouter from "./studioflow";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studioflowRouter);
router.use(jobProposalsRouter);

export default router;
