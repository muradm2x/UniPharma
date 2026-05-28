import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import candidatesRouter from "./candidates";
import employersRouter from "./employers";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import offersRouter from "./offers";
import notificationsRouter from "./notifications";
import packagesRouter from "./packages";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(candidatesRouter);
router.use(employersRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(offersRouter);
router.use(notificationsRouter);
router.use(packagesRouter);
router.use(adminRouter);

export default router;
