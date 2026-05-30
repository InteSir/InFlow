import Router from "express"
import { generateMFASetupController, revokeMFAController, verifyMFALoginController, verifyMFASetupController } from "../controllers/mfa.controller";

const mfaRoutes = Router();


mfaRoutes.get("/setup",generateMFASetupController);
mfaRoutes.post("/verify",verifyMFASetupController);
mfaRoutes.put("/revoke",revokeMFAController);
mfaRoutes.post("/verify-login",verifyMFALoginController);

export default mfaRoutes;