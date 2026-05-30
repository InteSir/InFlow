import { Env } from "../config/env.config";
import { sendEmail } from "../mailer/mailer";

type ContactFormParams = {
    name:string;
    email:string;
    message:string;
};

export const sendContactMessage = async({
    name,
    email,
    message,
}:ContactFormParams)=>{
    return await sendEmail({
        to:Env.SENDER_EMAIL as string,

        from:Env.SENDER_EMAIL as string,
        replyTo:email,
        subject: "Message from InarFlow Contact Form",
        text:`
            Name: ${name}
            Email: ${email}

            Message:
            ${message}
                `,
                html: `
                <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">
                    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e5e5;">
                    
                    <div style="background:#111827; padding:24px; text-align:center;">
                        <h1 style="color:white; margin:0;">InarFlow Contact Message</h1>
                    </div>

                    <div style="padding:32px;">
                        <p style="font-size:16px; color:#374151;">
                        You received a new message from your contact form.
                        </p>

                        <div style="margin-top:24px;">
                        <p style="margin:0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin:12px 0 0;"><strong>Email:</strong> ${email}</p>
                        </div>

                        <div style="margin-top:24px; padding:20px; background:#f9fafb; border-radius:10px;">
                        <p style="margin:0 0 12px; font-weight:bold;">Message</p>
                        <p style="margin:0; line-height:1.7; color:#4b5563;">
                            ${message.replace(/\n/g, "<br/>")}
                        </p>
                        </div>
                    </div>

                    <div style="padding:20px; text-align:center; background:#f9fafb; color:#6b7280; font-size:13px;">
                        © ${new Date().getFullYear()} InarFlow
                    </div>
                    </div>
                </div>
                `,
            });
            };