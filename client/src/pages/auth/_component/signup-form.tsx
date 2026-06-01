import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/routes/common/routePath";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRegisterMutation } from "@/features/auth/authAPI";
import GoogleAuthButton from "@/components/ui/googleAuthButton";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignUpForm = () => {
  const navigate = useNavigate();
  const [registerUser,{isLoading}] = useRegisterMutation();
  


  const {register,handleSubmit,reset,formState:{errors}} = useForm<FormValues>({
    resolver:zodResolver(schema),
  }) 

  const onSubmit = (values: FormValues) => {
    registerUser(values)
    .unwrap()
    .then(() => {
      reset();
      toast.success("Sign up successful");
      navigate(AUTH_ROUTES.SIGN_IN);
    })
    .catch((error) => {
      console.log(error);
      toast.error(error.data?.message || "Failed to sign up");
    });
  };

  return (
    
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 md:max-w-xs  max-w-[18rem] mx-auto mt-4 mb-6"
      >
        {/* header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Sign up .</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Fill information below to sign up
          </p>
        </div>

        {/* Name */}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input {...register("name")} placeholder="John Doe" className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div >
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register("email")}    placeholder="m@example.com" className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
           {errors.email && (
               <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
              </p>
           )}

        </div>

        <div >
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" {...register("password")}    placeholder="m@example.com" className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
           {errors.password && (
               <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
              </p>
           )}

        </div>
        <p className="text-xs dark:text-slate- font-normal">
          By signing in, you agree to our{" "}
          <a className="text-blue-600 hover:underline" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-blue-600 hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
 

        <button disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer">
   
          {isLoading && <Loader className="h-4 w-4 animate-spin"/>}
          SignUp
        </button>

         {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3 text-sm text-gray-400">
        <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
        <span>Or continue with</span>
        <span className="flex-1 border-t border-gray-300 dark:border-gray-700" />
      </div>

      <GoogleAuthButton mode="signup" />


        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_IN}
            className="underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </form>
  
  );
};

export default SignUpForm;