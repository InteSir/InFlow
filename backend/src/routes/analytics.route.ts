import {Router} from 'express';
import { chartAnalyticsController, expensePieChartController, summaryAnalyticsController } from '../controllers/analytics.controller';


const analyticsRoutes = Router();

analyticsRoutes.get("/summary",summaryAnalyticsController);
analyticsRoutes.get("/chart",chartAnalyticsController);
analyticsRoutes.get("/expense-breakdown",expensePieChartController);



export default analyticsRoutes;
