import { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Authorization Required - Secure OAuth 2.0 Connection",
};

export default function Page() {
  return <LoginPageClient />;
}