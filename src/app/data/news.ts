export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  date: string;
}

export const newsData: NewsArticle[] = [
  {
    id: 1,
    title: "New Refugee Cap Policy Announced for 2024",
    summary: "Administration announces significant increase in refugee admission ceiling, allowing up to 125,000 refugees to be resettled in the upcoming fiscal year. The policy includes expanded priority categories for vulnerable populations.",
    date: "2024-04-20",
  },
  {
    id: 2,
    title: "Enhanced Background Check Procedures Implemented",
    summary: "Department of Homeland Security rolls out new streamlined background check process designed to reduce processing times while maintaining security standards. The changes aim to address the growing backlog of refugee applications.",
    date: "2024-04-18",
  },
  {
    id: 3,
    title: "Local Integration Funding Program Expanded",
    summary: "Federal government announces $500 million in additional funding for local refugee integration programs, focusing on employment services, language training, and community support initiatives across 15 states.",
    date: "2024-04-16",
  },
];
