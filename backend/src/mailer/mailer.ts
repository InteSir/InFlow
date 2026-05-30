
import {Env} from "../config/env.config";
import nodemailer from "nodemailer";

type Params = {
    to:string | string[];
    subject: string;
    text:string;
    html:string;
    from?:string;
    replyTo?:string;
};
const mailer_sender = `InarFlow <${Env.SENDER_EMAIL}>`;

const transporter = nodemailer.createTransport({
    host:Env.SMTP_HOST,
    port:Env.SMTP_PORT,
    secure:false,
    auth:{
        user:Env.SMTP_USER,
        pass:Env.SMTP_PASSWORD,
    },
});

export const sendEmail = async({
    to,
    from=mailer_sender,
    subject,
    text,
    html,
    replyTo,

}:Params)=>{
    try{
        const info = await transporter.sendMail({
            from,
            to:Array.isArray(to) ? to.join(", ") : to,
            subject,
            text,
            html,

        });
        return{
            data:{
                id:info.messageId,

            },
            error:null,
        };

    }catch(error:any){
        return{
            data:null,
            error:{
                name:error.name,
                message:error.message,
            },
        }

    }

};