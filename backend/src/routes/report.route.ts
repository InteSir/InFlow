import {Router} from 'express';
import { generateReportController, getAllReportsController, updateReportSettingController } from '../controllers/report.controller';



const reportRoutes = Router();

reportRoutes.put("/update-setting",updateReportSettingController);
reportRoutes.get("/all",getAllReportsController);
reportRoutes.get("/generate",generateReportController);



export default reportRoutes;