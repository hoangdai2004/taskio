import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SignIn",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
