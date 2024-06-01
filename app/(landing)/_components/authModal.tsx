import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaGithub, FaGoogle } from "react-icons/fa";
import { CredentialForm } from "./credentialForm";
import { z } from "zod";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { register } from "@/lib/action";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthModalProps = {
  buttonText: string,
  inContent?: boolean
}

export function AuthModal({ buttonText, inContent }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState({ github: false, google: false, credentials: false});

  const router = useRouter();

  const baseSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: "This field has to be filled.",
      })
      .email({
        message: "This is not a valid email.",
      })
      .max(50, {
        message: "Password can't be longer than 50 characters.",
      }),
    password: z
      .string()
      .min(6, {
        message: "Password must be at least 6 characters.",
      }),
  });
  
  const registrationSchema = baseSchema.extend({
    username: z
      .string()
      .min(2, {
        message: "Username must be at least 2 characters.",
      })
      .max(20, {
        message: "Username can't be longer than 20 characters."
      }),
    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm-Password must be at least 6 characters.",
      }),
    avatarImg: z.instanceof(File).optional().refine((file) => file!.size <= 2000000, `Max image size is 2MB.`),
  }).superRefine(({ confirmPassword, password }, ctx) => {
    if(confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"]
      })
    }
  });

  const onLoginSubmit = async (values: z.infer<typeof baseSchema>) => {
    setIsLoading({
      ...isLoading,
      credentials: true,
    });

    try {
      const res = await signIn("credentials", { 
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if(!res?.error) {
        toast.success('Welcome back!');
        router.push('/notes');
      } else {
        throw new Error(res.error)
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading({
        ...isLoading,
        credentials: false,
      });
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof registrationSchema>) => {
    setIsLoading({
      ...isLoading,
      credentials: true,
    });
    const formData = new FormData();

    Object.keys(values).forEach(key => {
      const value = (values as any)[key];
  
      // Handle the file input separately
      if (key === 'avatarImg') {
        if(value === undefined) {
          formData.append(key, '');
        } else {
          formData.append(key, value);
        }
      } else {
        formData.append(key, value);
      }
    });
    
    try {
      const res = await register(formData);
  
      if(res.error) {
        toast.error(`${res.error}, please try again.`);
      } else {
        toast.success(res.message);
        await signIn("credentials", { 
          email: values.email,
          password: values.password,
          redirect: false,
        });
        router.push('/notes');
      }
    } finally {
      setIsLoading({
        ...isLoading,
        credentials: false,
      });;
    }
  };

  const handleGithubSubmit = async () => {
    setIsLoading({
      ...isLoading,
      github: true,
    });

    try {
      const res = await signIn("github", { callbackUrl: '/notes' });

      if(!res?.error) {
        toast.success('Welcome back!');
      }
    } finally {
      setIsLoading({
        ...isLoading,
        github: false,
      });
    }
  }

  const handleGoogleSubmit = async () => {
    setIsLoading({
      ...isLoading,
      google: true,
    });

    try {
      const res = await signIn("google", { callbackUrl: '/notes' }); 

      if(!res?.error) {
        toast.success('Welcome back!');
      }
    } finally {
      setIsLoading({
        ...isLoading,
        google: false,
      });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {
          buttonText === "Log in" ? 
          <Button variant="outline">{buttonText}</Button> :
          <Button 
            variant="default"

          >
            {
              inContent ? (
                <>
                  <LogIn className="mr-2" />
                  <span>{buttonText}</span>
                </>
              ) :
              buttonText
            }
          </Button> 
        }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{buttonText}</DialogTitle>
          <DialogDescription className={cn(buttonText !== 'Log in' && `hidden md:block`)}>
            Log in directly with
          </DialogDescription>
        </DialogHeader>
        <div className={cn('flex flex-col gap-2', buttonText !== 'Log in' && 'hidden md:flex')}>
          <Button
            disabled={isLoading.github}
            onClick={() => {
              handleGithubSubmit();
            }}
          >
            { isLoading.github && <Spinner /> }
            <FaGithub className="ml-2" />
            <span className="mx-2">GitHub</span>
          </Button>
          <Button
            disabled={isLoading.google}
            onClick={() => {
              handleGoogleSubmit();
            }}
            variant="destructive"
          >
            { isLoading.google && <Spinner /> }
            <FaGoogle className="ml-2" />
            <span className="mx-2">Google</span>
          </Button>
        </div>
        <div className={cn(`flex justify-center items-center`,
        buttonText !== 'Log in' && `hidden md:flex`)}>
          <hr className="flex-1 mr-1" />
          <p>or</p>
          <hr className="flex-1 ml-1" />
        </div>
        <DialogHeader>
          <DialogDescription>
            {
              buttonText === 'Log in' ?
              'Log in with email and password' :
              'Sign up with email and password'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {
            buttonText === 'Log in' ?
            <CredentialForm 
              schema={baseSchema} 
              defaultValues={{ email: "", password: "" }}
              onSubmit={onLoginSubmit}
              isLoading={isLoading.credentials}
            />:
            <CredentialForm 
              schema={registrationSchema} 
              defaultValues={{ email: "", password: "", confirmPassword: "", username: "" }}
              onSubmit={onSignupSubmit}
              isLoading={isLoading.credentials}
            />
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
