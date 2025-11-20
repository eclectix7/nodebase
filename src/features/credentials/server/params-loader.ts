import { credentialsParams } from "@/features/credentials/params";
import { createLoader } from "nuqs/server";

export const credentialsParamsLoader = createLoader(credentialsParams);
