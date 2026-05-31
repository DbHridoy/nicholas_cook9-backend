export const coveredProducts = ["carpet", "lvp_laminate", "hardwood", "tile"] as const;
export type CoveredProduct = (typeof coveredProducts)[number];

export const contractTerms = ["3_year_coverage", "5_year_coverage"] as const;
export type ContractTerm = (typeof contractTerms)[number];

export const contractTermYears: Record<ContractTerm, number> = {
  "3_year_coverage": 3,
  "5_year_coverage": 5,
};
