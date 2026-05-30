import mongoose,{Document,Schema} from "mongoose"


export interface SessionDocument extends Document{
    userId:mongoose.Types.ObjectId;
    userAgent?:string;
    expiredAt:Date;
    createdAt:Date;
}

const sessionSchema = new Schema<SessionDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        index:true,
        required:true,
    },
    userAgent:{type:String,required:false},
    createdAt:{
        type:Date,
        default:Date.now
    },
    expiredAt:{
        type:Date,
        required:true,
        default:()=>new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //thirty days from now 
    }

});

const SessionModel = mongoose.model<SessionDocument>("Session",sessionSchema);
export default SessionModel;