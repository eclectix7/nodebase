import { requireAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireAuth();

  return <div>Credentials</div>;
};

export default page;
