import {createAuthClient} from "better-auth/client";
import {stripeClient} from "@better-auth/stripe/client";

export const authClient = createAuthClient({
    baseURL:"http://localhost:8000",
    plugins:[
        stripeClient({
            subscription:true,
        })
    ]
})