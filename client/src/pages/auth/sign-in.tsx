import SignInForm from "./_component/signin-form";
import Logo from "@/components/logo/logo";


const SignIn = () => {

  return (
    <div className="grid min-h-svh lg:grid-cols-1 ">
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6 ">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo url="/" />
        </div>
        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-md dark:bg-white/5 
  dark:backdrop-blur-xl 
  dark:border dark:border-white/10 
  dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] 
  rounded-xl ">
            <SignInForm />
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default SignIn;
