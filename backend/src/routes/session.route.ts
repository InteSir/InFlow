import {Router} from 'express';
import { deleteSessionController, getAllSessionController, getSessionController } from '../controllers/session.controller';


const  sessionRoutes = Router();

sessionRoutes.get("/all",getAllSessionController);
sessionRoutes.get("/",getSessionController);
sessionRoutes.delete("/:id",deleteSessionController);

export default sessionRoutes;