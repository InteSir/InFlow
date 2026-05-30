import mongoose,{Document,Schema} from "mongoose"
import {v4 as uuidv4} from 'uuid';
import { VerificationEnum } from "../enums/verification.enum";

export function generateUniqueCode(){
    return uuidv4().replace(/-/g,"").substring(0,25);
}

export interface VerificationCodeDocument extends Document{
        userId:mongoose.Types.ObjectId;
        code:string;
        type:VerificationEnum;
        expiredAt:Date;
        createdAt:Date;
}

const VerificationCodeSchema =  new Schema<VerificationCodeDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        index:true,
        required:true,
    },
    code:{
        type:String,
        unique:true,
        required:true,
        default:generateUniqueCode,
    },
    type:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    expiredAt:{
        type:Date,
        required:true,
    }

});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>("VerificationCode",VerificationCodeSchema,"verificationDb");//verificationDb name to use as in db
export default VerificationCodeModel;