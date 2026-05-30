import { useForgotPasswordMutation } from '@/features/auth/authAPI';
import { zodResolver } from '@hookform/resolvers/zod';
import {  Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Logo from '@/components/logo/logo';
import { ArrowLeft, Loader, MailCheckIcon } from 'lucide-react';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mutate, {isLoading}] = useForgotPasswordMutation();

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: 'Email is required',
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values)
      .unwrap()
      .then(() => {
        toast.success('Reset link sent to your email');
        setIsSubmitted(true);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.data?.message || 'Failed to send  Reset link sent to your email');
      });
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-1">
      <div className="flex flex-col gap-4 p-6 md:p-10 md:pt-6">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo url="/" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          {!isSubmitted ? (
            <div className="w-full max-w-xs">
              <h1
                className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8
        text-center sm:text-left"
              >
                Reset Password
              </h1>
              <p className="mb-6 text-center sm:text-left text-base dark:text-[#f1f7feb5] font-normal">
                Include the email address associated with your account and we’ll
                send you an email with instructions to reset your password.
              </p>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    placeholder="m@example.com"
                    {...register('email')}
                    className="w-full border border-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer"
                >
                  {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                  Send reset instructions
                </button>
              </form>
            </div>
          ) : (
            <div className="w-full h-[80vh] flex flex-col gap-2 items-center justify-center rounded-md">
              <div className="size-[48px]">
                <MailCheckIcon size="48px" className="animate-bounce" />
              </div>
              <h2 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold">
                Check your email
              </h2>
              <p className="mb-2 text-center text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal">
                We just sent a password reset link to {getValues('email')}.
              </p>

               <Link to="/">
                    <button className=" bg-blue-500 h-[40px] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer p-2">
                          <ArrowLeft />
                                  Go to login
                              
                          </button>
                </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
