import { useResetPasswordMutation } from "@/features/auth/authAPI";
import { Link, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AUTH_ROUTES } from "@/routes/common/routePath";
import Logo from "@/components/logo/logo";
import { ArrowLeft, Frown, Loader } from "lucide-react";



export default function ResetPassword(){
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const exp = Number(searchParams.get("exp"));
  const navigate = useNavigate();
  const isValid = code && exp && exp > Date.now();
  const [mutate,{isLoading}] = useResetPasswordMutation();


  const formSchema = z.object({
    password:z.string().trim().min(1,{message:"Password is required,"}),
    confirmPassword:z.string().trim().min(1,{message:"Confirm Password is required,"}),
  }).refine((data)=> data.password === data.confirmPassword,{
    message:"Password does not match",
    path:["confirmPassword"],
  });

  const {register,handleSubmit,formState:{errors},} = useForm<z.infer<typeof formSchema>>({
    resolver:zodResolver(formSchema),
        defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values:z.infer<typeof formSchema>)=>{
      if(!code){
          navigate('/forgot-password?email=');  
        return
      }
      const data = {
        password:values.password,
        verificationCode:code,
      }

      mutate(data)
        .unwrap()
        .then(()=>{
           toast.success('Password reset successfully');
           setTimeout(() => {
              navigate(AUTH_ROUTES.SIGN_IN);
          }, 1000);
            
        })

  }

  


  return <div className="grid min-h-svh lg:grid-cols-1">
    <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6 ">
      <div className="flex justify-center gap-2 md:justify-start">
        <div className=""><Logo url="/"/></div>
      </div>

      <div className="flex flex-1 justify-center items-center">
        {isValid ? (
          <div className="w-full max-w-xs">
            <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8
        text-center sm:text-left">Set up a new Password</h1>
            <p className="mb-6 text-center sm:text-left text-[15px] dark:text-[#f1f7feb5] font-normal">Your password must be different from your previous one.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div >
                <label className="block text-sm font-bold mb-2">Password</label>
                <input placeholder="Enter your password" {...register("password")} className="w-full border border-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"></input>

                {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
              </div>
              <div className="">
                <label className="block text-sm font-bold mb-2">Confirm Password</label>
                <input placeholder="Enter your password again" {...register("confirmPassword")} className="w-full border border-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"></input>
                 {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
              </div>

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer" type="submit" disabled={isLoading}>
                 {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                Update Password</button>
            </form>
          </div>
        ):(
          <div className="w-full h-[80vh] flex flex-col gap-2 items-center justify-center rounded-md">
              <div className="size-[48px]">
                <Frown size="48px" className="animate-bounce text-red-500" />
              </div>
              <h2 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold">
                Invalid or expired reset link
              </h2>
              <p className="mb-2 text-center text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal">
                You can request a new password reset link
              </p>
              <Link to="/forgot-password?email=">
                <button className=" bg-blue-500 h-[40px] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer p-2">
                    <ArrowLeft />
                    Go to forgot password
                
                </button>
              </Link>

        </div>
        )}
      </div>
    </div>

  </div>
}