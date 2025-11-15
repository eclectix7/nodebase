import LoginForm from "@/features/auth/components/login-form";
import { requireUnauth } from "@/lib/auth-utils";
import React from "react";

const Page = async () => {
  await requireUnauth();

  return (
    <div className="p-4">
      <LoginForm />{" "}
    </div>
  );
};

export default Page;
