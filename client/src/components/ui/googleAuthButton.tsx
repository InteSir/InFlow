import { useGoogleAuthMutation } from "@/features/auth/authAPI";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { GoogleLogin } from "@react-oauth/google";


interface Props {
    mode:"signin" | "signup";
}
const GoogleLoginComponent = GoogleLogin as any;
export const GoogleAuthButton = ({ mode }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleAuth,{isLoading}] = useGoogleAuthMutation();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential; // 🔥 THIS IS THE ID TOKEN

      const result = await googleAuth({ idToken }).unwrap();


       if(result.user.userPreference.enable2FA){
              dispatch(setCredentials({...result,mfaPending:true}));
              navigate(`/verify-mfa?email=${result.user.email}`);
              
              
        }else{
              dispatch(setCredentials(result));
              toast.success(
                mode === "signup"
                  ? "Account created with Google!"
                  : "Logged in with Google!"
              );
              setTimeout(() => navigate(PROTECTED_ROUTES.OVERVIEW), 1000);
      
      }
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Google sign-in failed");
    }
  };

  return (
    <div className="w-full min-h-[40px] flex justify-center items-center my-2">
      {isLoading ? (
        <div className="text-sm text-gray-500 animate-pulse">Authenticating account...</div>
      ) : (
    <GoogleLoginComponent
      onSuccess={handleSuccess}
      onError={() => toast.error("Google login failed")}
      text={mode === "signup" ? "signup_with" : "continue_with"}
      theme="filled_blue" // Optional: makes the branding stand out cleanly
          shape="rectangular"
          width="320"
      
    />
      )}
    </div>
  );
};



export default GoogleAuthButton;