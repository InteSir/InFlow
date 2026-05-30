import { apiClient } from "@/app/api-client";

type SessionType = {
    _id:string;
    userId:string;
    userAgent:string;
    createdAt:string;
    expiresAt:string;
    isCurrent:boolean;

};

type SessionResponseType = {
    message:string;
    sessions:SessionType[];
}
export const sessionApi = apiClient.injectEndpoints({
   
    endpoints:(builder)=>({
        GetAllSession:builder.query<SessionResponseType,void>({
            query:()=>({
                url:"/session/all",
                method:"GET",

              }),
              providesTags:["Session"],
             
        }),

        deleteSession:builder.mutation({
             query:(id)=>({
                url:`/session/${id}`,
                method:"DELETE",

              }),
              invalidatesTags: ["Session"],

        }),

        getUserSession:builder.mutation({
            query:()=>({
                url:"/session/",
                method:"GET",

            })
        })
    })
});
export const { 
    useGetAllSessionQuery, 
    useDeleteSessionMutation, 
    useGetUserSessionMutation 
} = sessionApi;