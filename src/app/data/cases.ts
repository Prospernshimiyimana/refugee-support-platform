export interface LegalCase {
  id: number;
  title: string;
  status: 'Active' | 'Pending' | 'Blocked';
  description: string;
}

export const casesData: LegalCase[] = [
  {
    id: 1,
    title: "Pacito v. Trump",
    status: "Active",
    description: "Legal challenge to refugee ban - constitutional challenge arguing that the executive order violates due process and equal protection clauses of the Constitution.",
  },
  {
    id: 2,
    title: "Refugee Cap Expansion",
    status: "Pending",
    description: "Federal lawsuit challenging the administration's decision to maintain refugee admission caps at historically low levels, arguing it violates statutory requirements.",
  },
  {
    id: 3,
    title: "Green Card Restrictions",
    status: "Blocked",
    description: "Legal challenge against new public charge rule that makes it more difficult for immigrants to obtain green cards if they use public benefits.",
  },
  {
    id: 4,
    title: "Doe v. Immigration Services",
    status: "Active",
    description: "Challenging the denial of asylum application based on changed country conditions. Client faces persecution if returned to home country.",
  },
  {
    id: 5,
    title: "Work Authorization Appeal",
    status: "Active",
    description: "Appeal against denial of employment authorization for asylee with pending adjustment of status application.",
  },
  {
    id: 6,
    title: "U-Visa Certification Case",
    status: "Pending",
    description: "Seeking U-visa certification for victim of crime who cooperated with law enforcement investigation.",
  },
];
