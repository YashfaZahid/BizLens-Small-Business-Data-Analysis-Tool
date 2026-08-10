import { Router, type IRouter } from "express";
import healthRouter from "./health";
import datasetsRouter from "./datasets";
import reportsRouter from "./reports";
import questionsRouter from "./questions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(datasetsRouter);
router.use(reportsRouter);
router.use(questionsRouter);

export default router;
