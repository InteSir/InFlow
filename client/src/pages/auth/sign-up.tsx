import SignUpForm from "./_component/signup-form"
import Logo from "@/components/logo/logo"


const SignUp = () => {

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
  rounded-xl bg-[var(--card)] shadow-[0_4px_20px_-2px_rgba(20,20,20,0.04),0_2px_6px_-1px_rgba(20,20,20,0.02)]">
            <SignUpForm />
          
          </div>
        </div>
      </div>
     
    </div>
  )
}

export default SignUp