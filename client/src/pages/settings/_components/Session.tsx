import { useDeleteSessionMutation, useGetAllSessionQuery } from "@/features/session/sessionApi"
import { Loader } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import SessionItem from "./SessionItem";




export default function Sessions(){
    const{data:sessionData,isLoading:isFetching} = useGetAllSessionQuery();

    const [deleteSession,{isLoading:isDeleting}] =  useDeleteSessionMutation();




    
    const sessions = sessionData?.sessions || [];
    const currentSession = sessions?.find((session)=>session.isCurrent);
    const otherSessions =  sessions?.filter((session)=>session.isCurrent !== true);

    const handleDelete = useCallback((id:string)=>{
        deleteSession(id)
            .unwrap()
            .then(()=>{
                toast.success("Session removed successfully") //invalidate or refetech
            })
            .catch((error)=>{
                toast.error("Failed to delete the session",error)
            })
            
    },[]);


    return(
     <div className="via-root to-root rounded-xl bg-gradient-to-r p-0.5 mt-5">
      <div className="rounded-[10px]">

        {isFetching ? ( <Loader size="35px" className="animate-spin"/>):(

        <div className="rounded-t-xl max-w-xl">
          <div>
            <h5 className="text-lg tracking-[-0.16px] text-slate-12 font-bold mb-1">Active session</h5>
            <p className="mb-6 text-sm text-[#0007149f] dark:text-gray-100">
            Manage the devices logged in your account
            </p>
          </div>
          <div className="w-full">
            {currentSession && (

            <div className="w-full py-2 border-b pb-5">
              <SessionItem
                userAgent={currentSession.userAgent}
                date={currentSession.createdAt}
                expiresAt={currentSession.expiresAt}
                isCurrent={currentSession.isCurrent}
              />
            </div>
            )}
            <div className="mt-4">
              <h5 className="text-base font-semibold">Other sessions</h5>
              <ul className="mt-4 w-full space-y-3 max-h-[400px] overflow-y-auto">
                {otherSessions?.map((session)=>(
                  <li>
                    <SessionItem 
                      loading={isDeleting}
                      userAgent={session.userAgent}
                      date={session.createdAt}
                      expiresAt={session.expiresAt}
                      onRemove={()=>handleDelete(session._id)}
                     />
                  </li>

                ))}
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>

    )
}