import { CredentialForm } from "@/features/credentials/components/credential";
import { requireAuth } from "@/lib/auth-utils";
import React from "react";

const page = async () => {
  await requireAuth();

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="flex flex-col mx-auto max-w-screen w-full h-full gap-y-8">
        <CredentialForm />
      </div>
    </div>
  );
};

export default page;
