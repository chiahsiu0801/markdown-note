"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { UseFormReturn, useForm } from "react-hook-form"
import { ZodEffects, ZodObject, z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader } from "lucide-react"
import { Spinner } from "@/components/spinner"

type FormProps = {
  schema: z.ZodSchema<any>;
  defaultValues: Record<string, any>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
};

export function CredentialForm({ schema, defaultValues, onSubmit, isLoading }: FormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  }) as UseFormReturn<z.infer<typeof schema>>;

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
      {
        schema instanceof ZodEffects && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      }
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {
          schema instanceof ZodEffects && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>Please confirm your password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) 
        }
        {
          schema instanceof ZodEffects && (
            <FormField
              control={form.control}
              name="avatarImg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Image</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={(event) => {
                          field.onChange(event.target.files?.[0])
                        }
                      } 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) 
        } 
        <Button disabled={isLoading} type="submit">
          {
            isLoading ?
            <div className="flex justify-center items-center">
              <Spinner />
              <span className="ml-2">{schema instanceof ZodEffects ? 'Creating an account...' : 'Logging in...'}</span>
            </div> :
            <span>Submit</span>
          }
        </Button>
      </form>
    </Form>
  )
}
