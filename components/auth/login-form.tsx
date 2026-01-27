"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import loginT from "@/types/LoginT";


function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
   const {
     register,
     handleSubmit,
     watch,
     formState: { errors },
   } = useForm<loginT>();
   const onSubmit: SubmitHandler<loginT> = (data) => console.log(data);
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your username below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" type="text" placeholder="your-username" {...register("username")} required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" placeholder="your-password" {...register("password")} required />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default LoginForm;
