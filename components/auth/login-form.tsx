"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginSchema } from "@/lib/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
  });

  const notify = (message: string, type: "success" | "error" | "info") => {
    toast[type](message);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    const { username, password } = data;
    if (!username || !password) {
      notify("Please fill in all required fields.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      console.log("Sign in response:", response);

      if (response?.error) {
        notify(response.error || "Login failed. Please try again.", "error");
        setIsSubmitting(false);
      } else if (response?.ok) {
        notify("Login successful!", "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        notify("Login failed. Please try again.", "error");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      notify("An error occurred during login. Please try again.", "error");
      setIsSubmitting(false);
    }
  };
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your username below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="your-username"
            {...register("username")}
            required
          />
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
          <Input
            id="password"
            type="password"
            placeholder="your-password"
            {...register("password")}
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default LoginForm;
