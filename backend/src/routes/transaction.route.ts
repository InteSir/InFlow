import {Router} from 'express';
import { bulkDeleteTransactionController, bulkTransactionController, createTransactionController, deleteTransactionController, duplicateTransactionController, getAllTransactionController, getTransactionByIdController, scanRecieptController, updateTransactionController } from '../controllers/transaction.controller';
import { localUpload } from '../config/localMulter.config';




const TransactionRoutes = Router();

TransactionRoutes.post("/create",createTransactionController);
TransactionRoutes.post("/scan-reciept",localUpload.single("file"),scanRecieptController);

TransactionRoutes.post("/bulk-transaction",bulkTransactionController);
TransactionRoutes.put("/duplicate/:id",duplicateTransactionController);
TransactionRoutes.get("/all",getAllTransactionController);
TransactionRoutes.get("/:id",getTransactionByIdController);
TransactionRoutes.put("/update/:id",updateTransactionController);
TransactionRoutes.delete("/delete/:id",deleteTransactionController);
TransactionRoutes.delete("/bulk-delete",bulkDeleteTransactionController);









export default TransactionRoutes;