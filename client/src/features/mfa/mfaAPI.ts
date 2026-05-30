import { apiClient } from "@/app/api-client";

export type mfaType = {
    message:string,
    secret:string,
    qrImageUrl:string,
}
type verifyMFAType = {
    code:string;
    secretKey:string;
};


export const mfaApi = apiClient.injectEndpoints({
    endpoints:(builder)=>({
        mfaSetup:builder.mutation<mfaType,void>({
            query:()=>({
                url:"/mfa/setup",
                method:"GET",

            })
        }),


        verifyMFA:builder.mutation<void,verifyMFAType>({
            query:(body)=>({
                url:"/mfa/verify",
                method:"POST",
                body:body
            }),
            invalidatesTags:["MFA"],
        }),

        revokeMFA:builder.mutation<void,void>({
            query:()=>({
                url:"/mfa/revoke",
                method:"PUT"
            }),
            invalidatesTags: ["MFA"],

        }),


        verifyMFALogin:builder.mutation({
            query:(body)=>({
                url:"/mfa/verify-login",
                method:"POST",
                body:body,
            })
        }),

    })
});



export const {useMfaSetupMutation,useVerifyMFAMutation,useRevokeMFAMutation,useVerifyMFALoginMutation} = mfaApi;