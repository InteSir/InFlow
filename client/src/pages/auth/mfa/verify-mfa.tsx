import { useVerifyMFALoginMutation } from '@/features/mfa/mfaAPI';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/hook';
import { setCredentials } from '@/features/auth/authSlice';
import { toast } from 'sonner';
import { PROTECTED_ROUTES } from '@/routes/common/routePath';
import Logo from '@/components/logo/logo';
import { useRef } from 'react';

export default function VerifyMFA() {
  const [params] = useSearchParams();
  const email = params.get('email');
  const navigate = useNavigate();
  const [mutate, { isLoading }] = useVerifyMFALoginMutation();
  const dispatch = useAppDispatch();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const FormSchema = z.object({
    pin: z
      .string()
      .min(6, { message: 'Your one-time password must be 6 characters.' }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const syncPin = () => {
    const otp = inputRefs.current.map((el)=>el?.value ?? '').join('');
    setValue('pin',otp,{shouldValidate:true});
  };

  const handleInput = (e:React.FormEvent<HTMLInputElement>,index:number)=>{
    const input = e.currentTarget;

    input.value = input.value.replace(/\D/g, '').slice(-1);

    if(input.value && index<inputRefs.current.length - 1){
        inputRefs.current[index + 1]?.focus();
    }
    syncPin();
  }
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







  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (!email) {
      navigate('/');
    }
    const data = {
      code: values.pin,
      email,
    };

    mutate(data)
      .unwrap()
      .then((response) => {
        dispatch(setCredentials(response));
        toast.success('MFA Verified successfully!');
        navigate(PROTECTED_ROUTES.OVERVIEW);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.data?.message || 'Invalid MFA code');
      });
  };




  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6 ">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="">
            <Logo url="/" />
          </div>
        </div>
        <div className='flex flex-1 justify-center items-center'>
            <div className='w-full max-w-xs'>
                 <h1
                    className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mt-8
                    text-center sm:text-left"
                    >
                    Multi-Factor Authentication
                    </h1>
                    <p className="mb-6 text-center sm:text-left text-[15px] dark:text-[#f1f7feb5] font-normal">
                    Enter the code from your authenticator app.
                    </p>
                    

                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <div className="flex flex-col items-center ">
                            <div className="flex gap-2 justify-center">
                                 {[...Array(6)].map((_, index) => (
                                    <input
                                    key={index}
                                    ref={(e) => {inputRefs.current[index] = e;}}
                                    type="text"
                                    maxLength={1}
                                    inputMode="numeric"
                                    name={`otp-${index}`}
                                    className="w-12 h-12 border border-gray-400 text-center text-4xl rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onInput={(e) => handleInput(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    />
                                ))}
                
                            </div>

                             {/* Hidden input for react-hook-form */}
                             <input type="hidden" {...register("pin")} id="pin" />
                             {errors.pin && (
                                    <p className="text-sm text-red-500">{errors.pin.message}</p>
                                )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[40px] mt-2 bg-black text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                            {isLoading && <span className="animate-spin">⏳</span>}
                            Continue →
                        </button>



                    </form>

            </div>


        </div>
      </div>
    </div>
  );
}
