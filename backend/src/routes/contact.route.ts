// routes/contact.route.ts

import express from "express";
import { contactController } from "../controllers/contact.controller";


const ContactRouter = express.Router();

ContactRouter.post("/send-message", contactController);

export default ContactRouter;