"use client";

import { useState } from "react";
import { subscribe } from "@/app/(blog)/actions";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Balancer from "react-wrap-balancer";

import { Section, Container } from "@/components/craft";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export const SubscribeForm = () => {
  const [message, setMessage] = useState<string>("");
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const result = await subscribe(values.email);
    console.log("result", result.message);
    setMessage(result.message);

    if (result.success) {
      form.reset({ email: "" });
    }
  };

  return (
    <Section>
      <Container className="space-y-8">
        <h2 className="!my-0 uppercase">Pozostańmy w kontakcie</h2>
        <p className="text-lg opacity-70 md:text-2xl">
          <Balancer>
            Jeśli uważasz, że nasze produkty wnoszą wartość do Twojego biznesu,
            i chcesz być jednym z pierwszych klientów, którzy mają szansę
            skorzystać z okazjonalnych promocji wpisz swój adres email -
            skontaktujemy się z Tobą.
          </Balancer>
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="md:w-96"
                      placeholder="example@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {message && <p>{message}</p>}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Subskrybuj</Button>
          </form>
        </Form>
      </Container>
    </Section>
  );
};
