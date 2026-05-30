import { useTypedSelector } from "@/app/hook";
import {useMfaSetupMutation, useRevokeMFAMutation, useVerifyMFAMutation } from "@/features/mfa/mfaAPI";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader, XIcon } from "lucide-react"
import { updateCredentials } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
export default function EnableMfa(){
    const {user} = useTypedSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [showKey,setShowKey] = useState(false);
    const [isOpen,setIsOpen] = useState(false);
    const [copied,setCopied] = useState(false);
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  
    const [mfaSetup,{data:mfaData,isLoading:isFetching}] = useMfaSetupMutation();
    const [verifyMFA,{isLoading}] = useVerifyMFAMutation();
    const [revokeMFA,{isLoading:isRevoking}] = useRevokeMFAMutation();


   const FormSchema = z.object({
    pin:z.string().min(6,{
          message: "Your one-time password must be 6 characters.",
    })
   });


   const {register,handleSubmit,setValue,formState:{errors}} = useForm<z.infer<typeof FormSchema>>({
      resolver:zodResolver(FormSchema),
      defaultValues: {
        pin: '',
    },
   });


   const handleOpenDialog = () => {
      setIsOpen(true);
      mfaSetup();
   };
   const handleInput = (e:React.FormEvent<HTMLInputElement>,index:number)=>{
    const input = e.currentTarget;

    input.value = input.value.replace(/\D/g, '').slice(-1);

    if(input.value && index<inputRefs.current.length - 1){
        inputRefs.current[index + 1]?.focus();
    }
    syncPin();
  }
  const onCopy = useCallback(
    (value: string) => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    },
    []
  );
  const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>,index:number)=>{
    if(e.key === "Backspace" && e.currentTarget.value === '' && index > 0){
        inputRefs.current[index-1]?.focus();
    }
  };

   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const chars = e.clipboardData.getData('text').replace(/\D/g, '').slice(0,6).split('');
    chars.forEach((char,i)=>{
        if(inputRefs.current[i]){
            inputRefs.current[i]!.value = char;
        }
    });

    const nextEmpty = chars.length < 6 ? chars.length : 5;
    inputRefs.current[nextEmpty]?.focus();
    syncPin();


  };


   const syncPin = () => {
    const otp = inputRefs.current.map((el)=>el?.value ?? '').join('');
    setValue('pin',otp,{shouldValidate:true});
  };



   const onSubmit = async (values: z.infer<typeof FormSchema>) => {
        const data = {
            code:values.pin,
            secretKey:mfaData?.secret ?? "",

        };

        verifyMFA(data)
            .unwrap()   
            .then(() => {   
                toast.success("MFA enabled successfully.");
                 dispatch(updateCredentials({
                  user: { userPreference: { enable2FA: true } }  // ✅
                }));
                setIsOpen(false);
         
            })
            .catch((error) => {
            
                toast.error(error.data?.message || 'Verification failed.');
            });
   };

   


  



    useEffect(()=>{
      if(isOpen){document.body.style.overflow = "hidden";

      }else{
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };

    },[isOpen])







    return (
      <div className="via-root to-root rounded-xl bg-gradient-to-r  py-2 border-b pb-5">
        <div className="rounded-[10px] ">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h3 className="text-lg tracking-[-0.16px] text-slate-900 dark:text-white font-bold mb-1">Multi-Factor Authentication (MFA)</h3>

              {user?.userPreference?.enable2FA && (
              <span className="select-none whitespace-nowrap font-medium bg-green-100 text-green-600 text-xs h-6 px-2 rounded flex items-center justify-center gap-1">
                Enabled
              </span>
            )}
          </div>
          <p className="mb-6 text-sm text-slate-600 dark:text-gray-100 font-normal">Protect your account by adding an extra layer of security.</p>

          {user?.userPreference?.enable2FA?(

            <button disabled={isRevoking} className="h-[35px] text-[#c40006d3] bg-red-100 shadow-none px-2 rounded-sm hover:bg-red-200 cursor-pointer "onClick={() =>{revokeMFA()
                                      .unwrap()   
                                      .then(() => {   
                                              toast.success("MFA revoked successfully.");
                                               dispatch(updateCredentials({
                                                user: { userPreference: { enable2FA: false } }  // ✅
                                              }));
               
         
                                      })
                                    .catch((error) => {
            
                                        toast.error(error.data?.message || 'Failed to revoke MFA');
            });}}>{isRevoking && <Loader className='animate-spin'/>} Revoke Access</button>
        
          ):(
            <>
            <button onClick={handleOpenDialog} disabled={isLoading} className="h-[35px] rounded-md px-4 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-[#C6FF34] dark:text-black">
              Enable MFA
            </button>

            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative"
                  >
                   <button onClick={()=>{setIsOpen(false)}} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none">  <XIcon /></button>


                    <h2 className="text-[17px] text-slate-900 dark:text-white font-semibold mb-4">Setup Multi-Factor Authentication</h2>
                    <p className="text-sm text-slate-800 dark:text-white font-bold mt-6">Scan the QR code</p>

                    <span className="text-sm text-[#0007149f] dark:text-inherit font-normal">
                      Use an app like{" "}
                      <a
                        className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://support.1password.com/one-time-passwords/"
                      >
                        1Password
                      </a>{" "}
                      or{" "}
                      <a
                        className="!text-primary underline decoration-primary decoration-1 underline-offset-2 transition duration-200 ease-in-out hover:decoration-blue-11 dark:text-current dark:decoration-slate-9 dark:hover:decoration-current "
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://safety.google/authentication/"
                      >
                        Google Authenticator
                      </a>{" "}
                      to scan the QR code below.
                    </span>

                    <div className="mt-8 items-center flex justify-center flex-row gap-6">
                      <div className="shrink-0 rounded-md border border-slate-200 dark:border-gray-600 bg-white p-2">
                            {isFetching || !mfaData?.qrImageUrl ? (
                              <div className="w-[160px] h-[160px] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                            ):(
                               <img
                                  alt="QR code"
                                  decoding="async"
                                  src={mfaData.qrImageUrl}
                                  width="160"
                                  height="160"
                                  className="rounded-md"
                                />
                            )}
                      </div>

                      {showKey ? (
                        <div className="w-full">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-gray-400 font-normal">
                            <span>Copy setup Key</span>
                            <button 
                            onClick={()=>onCopy(mfaData?.secret ?? "")}
                            disabled={copied}
                            className="ml-1 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                            aria-label="Copy setup key"
                            >
                              {copied ? (
                                 <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-green-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              ):(
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              )}

                            </button>
                          </div>

                          <p className="text-sm block truncate w-[200px] text-black dark:text-gray-300 mt-1">
                            {mfaData?.secret}
                          </p>


                        </div>
                      ): (
                         <span className="text-sm text-slate-600 dark:text-gray-400 font-normal">
                        Can't scan the code?
                        <button
                          className="block text-blue-600 dark:text-white transition-colors hover:underline mt-0.5"
                          type="button"
                          onClick={() => setShowKey(true)}
                        >
                          View the Setup Key
                        </button>
                      </span>
                      )}

                    </div>

                    {/* OTP Input */}
                  <div className="mt-8 border-t border-slate-200 dark:border-gray-700 pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-slate-700 dark:text-gray-300 font-bold">
                          Then enter the code
                        </label>

                        {/* OTP Slots */}
                        <div className="flex items-center justify-center gap-2">
                              {[...Array(6)].map((_, index) => (
                                    <input
                                    key={index}
                                    ref={(e) => {inputRefs.current[index] = e;}}
                                    type="text"
                                    maxLength={1}
                                    inputMode="numeric"
                                    name={`otp-${index}`}
                                    className="w-12 h-12 border border-gray-400 text-center text-3xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onInput={(e) => handleInput(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    />
                            ))}
                        </div>

                        {/* Hidden single input that captures all digits */}
                         <input type="hidden" {...register("pin")} id="pin" />

                        {errors.pin && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.pin.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[40px] rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading && (
                          <svg
                            className="w-4 h-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                        )}
                        Verify
                      </button>
                    </form>
                  </div>


                </div>
              </div>
            )}
            </>

     

 
          )}

          



        </div>
      </div>

    )
}