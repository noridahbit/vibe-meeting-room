"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");

  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      const params = new URLSearchParams();

      if (typeof email === "string" && email.length > 0) {
        params.set("email", email);
      }

      params.set("error", "Invalid email or password.");
      redirect(`/login?${params.toString()}`);
    }

    throw error;
  }
}
