/** All entries and identifiers are fictional and designed for this public demonstration. */
export const resources = [
  { id: 'r1', type: 'article', audience: 'customers', title: 'Understanding your billing summary', description: 'A guide to reviewing a fictional monthly account statement.', topic: 'Billing', date: '2026-09-24', minutes: 6 },
  { id: 'r2', type: 'discussion', audience: 'partners', title: 'How do you validate a scheduled file import?', description: 'Community members share approaches to checking data quality before import.', topic: 'Data quality', date: '2026-09-21', replies: 12, moderator: true },
  { id: 'r3', type: 'article', audience: 'teams', title: 'Preparing for a routine data migration', description: 'A practical checklist for organising a fictional test migration.', topic: 'Migration', date: '2026-09-18', minutes: 4 },
  { id: 'r4', type: 'discussion', audience: 'customers', title: 'Account access: common questions', description: 'A discussion about resolving common sign-in and account-access scenarios.', topic: 'Account access', date: '2026-09-15', replies: 8, moderator: false },
  { id: 'r5', type: 'article', audience: 'partners', title: 'Getting started with data quality checks', description: 'How to set up simple, repeatable checks before sharing a data extract.', topic: 'Data quality', date: '2026-09-12', minutes: 5 },
  { id: 'r6', type: 'discussion', audience: 'teams', title: 'Sharing good practices for release checklists', description: 'A space for practical tips about preparing and reviewing a software release.', topic: 'Release management', date: '2026-09-07', replies: 3, moderator: true },
  { id: 'r7', type: 'article', audience: 'customers', title: 'Maintaining accurate account details', description: 'Example steps for checking contact preferences and profile details.', topic: 'Account management', date: '2026-08-29', minutes: 3 },
  { id: 'r8', type: 'discussion', audience: 'partners', title: 'Best practices for resolving rejected uploads', description: 'Explore ways to diagnose and resolve example file validation errors.', topic: 'Troubleshooting', date: '2026-08-22', replies: 19, moderator: true },
  { id: 'r9', type: 'article', audience: 'teams', title: 'Introduction to evidence and audit trails', description: 'Building an auditable process for routine technical tasks.', topic: 'Reporting', date: '2026-08-19', minutes: 7 }
];
export const audiences = {
  all: 'All communities',
  customers: 'Customers',
  partners: 'Partners',
  teams: 'Internal teams'
};
