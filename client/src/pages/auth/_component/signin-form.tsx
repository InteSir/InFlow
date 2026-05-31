import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useLoginMutation } from "@/features/auth/authAPI";
import { useAppDispatch } from "@/app/hook";
import { setCredentials } from "@/features/auth/authSlice";
import GoogleAuthButton from "@/components/ui/googleAuthButton";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login,{isLoading}] = useLoginMutation();

  // const form = useForm<FormValues>({
  //   resolver: zodResolver(schema),
  // });

  const {register,handleSubmit,formState:{errors},getValues} = useForm<FormValues>({
    resolver:zodResolver(schema)

  })

  const onSubmit = (values: FormValues) => {
    login(values)
    .unwrap()
    .then((data) => {
      console.log(data,"UserData");
      console.log(data.user.userPreference.enable2FA);

      if(data.user.userPreference.enable2FA){
        dispatch(setCredentials({...data,mfaPending:true}));
        navigate(`/verify-mfa?email=${values.email}`);
        
      }else{
        dispatch(setCredentials(data));
        toast.success("Login successful");
        setTimeout(() => navigate(PROTECTED_ROUTES.OVERVIEW), 1000);

      }

    })
    .catch((error) => {
      console.log(error);
      toast.error(error.data?.message || "Failed to login");
    });
  };

  return (
    
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-5 max-w-[18rem] md:max-w-xs mx-auto mt-8 pb-4", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center pb-4">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>


        <div>
          <label className="block text-sm font-bold mb-1">Email</label>
          <input placeholder="m@example.com" {...register("email")} className="w-full border border-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          {
            errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )
          }
        </div>


        <div>
          <label className="block text-sm font-bold mb-1">Password</label>
          <input type="password" placeholder="m@example.com" {...register("password")} className="w-full border border-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          {
            errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )
          }
        </div>


         <div className="mb-0 flex w-full items-center justify-end">
              <Link
                className="text-sm dark:text-white"
                to={`/forgot-password?email=${getValues("email")}`}
              >
                Forgot your password?
              </Link>
          </div>

          <button disabled={isLoading} type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer">
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            Login
          </button>


          {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className="relative flex items-center gap-3 text-sm text-gray-400">
          <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
          <span>Or continue with</span>
          <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
        </div>

         <GoogleAuthButton mode="signin" />




        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_UP}
            className="underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </form>
  
  );
};

export default SignInForm;
