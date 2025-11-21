import { executionsParams } from "@/features/executions/params";
import { createLoader } from "nuqs/server";

export const executionsParamsLoader = createLoader(executionsParams);
