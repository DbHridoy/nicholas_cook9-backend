import { z } from "zod";
import { contractTerms, coveredProducts } from "./contract.types.js";

export const createContractSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    propertyAddress: z.string().trim().min(5).max(250),
    installationDate: z.coerce.date(),
    coveredProduct: z.enum(coveredProducts),
    term: z.enum(contractTerms),
    price: z.number().nonnegative(),
    file: z.string().trim().min(1).max(2048),
  })
  .strict();

export type CreateContractInput = z.infer<typeof createContractSchema>;
