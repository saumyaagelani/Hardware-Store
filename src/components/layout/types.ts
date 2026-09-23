import type { AccountType, ContractorStatus, DepartmentId, UserRole } from "@/lib/types";

export interface HeaderUser {
  firstName: string;
  fullName: string;
  role: UserRole;
  accountType: AccountType;
  contractorStatus?: ContractorStatus;
  companyName?: string;
}

export interface NavCategory {
  slug: string;
  name: string;
  department: DepartmentId;
  subcategories: { slug: string; name: string }[];
  count: number;
}
