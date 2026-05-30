import SignUpForm from "./_component/signup-form"
import Logo from "@/components/logo/logo"
// import dashboardImg from "../../assets/images/dashboard_.png";
// import dashboardImgDark from "../../assets/images/dashboard_dark.png";
import { useTheme } from "@/context/theme-provider";


const SignUp = () => {
  const { theme } = useTheme();
  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6">
        <div className="flex justify-center gap-2 md:justify-start">
         <Logo url="/" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md dark:bg-white/5 
  dark:backdrop-blur-xl 
  dark:border dark:border-white/10 
  dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] 
  rounded-xl">
            <SignUpForm />
          
          </div>
        </div>
      </div>
     
    </div>
  )
}

export default SignUp