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
  const [googleAuth] = useGoogleAuthMutation();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential; // 🔥 THIS IS THE ID TOKEN

      const result = await googleAuth({ idToken }).unwrap();
      console.log("Google login:", result);

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
    <GoogleLoginComponent
      onSuccess={handleSuccess}
      onError={() => toast.error("Google login failed")}
      text={mode === "signup" ? "signup_with" : "continue_with"}
      
    />
  );
};



export default GoogleAuthButton;