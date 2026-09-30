/** Public, fictional fixtures. No employer content, identities or endpoints. */
export const resources = [
  { id: 'r1', type: 'article', audience: 'customers', title: 'Understanding your billing summary', description: 'A guide to reviewing a fictional monthly account statement.', topic: 'Billing', date: '2026-09-24', minutes: 6 },
  { id: 'r2', type: 'discussion', audience: 'partners', title: 'How do you validate a scheduled file import?', description: 'Community members share approaches to checking data quality before import.', topic: 'Data quality', topicId: 'quality', date: '2026-09-21' },
  { id: 'r3', type: 'article', audience: 'teams', title: 'Preparing for a routine data migration', description: 'A practical checklist for organising a fictional test migration.', topic: 'Migration', date: '2026-09-18', minutes: 4 },
  { id: 'r4', type: 'discussion', audience: 'customers', title: 'Account access: common questions', description: 'A discussion about resolving common sign-in and account-access scenarios.', topic: 'Account access', topicId: 'access', date: '2026-09-15' },
  { id: 'r5', type: 'article', audience: 'partners', title: 'Getting started with data quality checks', description: 'How to set up simple, repeatable checks before sharing a data extract.', topic: 'Data quality', date: '2026-09-12', minutes: 5 },
  { id: 'r6', type: 'discussion', audience: 'teams', title: 'Sharing good practices for release checklists', description: 'A space for practical tips about preparing and reviewing a software release.', topic: 'Release management', topicId: 'releases', date: '2026-09-07' },
  { id: 'r7', type: 'article', audience: 'customers', title: 'Maintaining accurate account details', description: 'Example steps for checking contact preferences and profile details.', topic: 'Account management', date: '2026-08-29', minutes: 3 },
  { id: 'r8', type: 'discussion', audience: 'partners', title: 'Best practices for resolving rejected uploads', description: 'Explore ways to diagnose and resolve example file validation errors.', topic: 'Troubleshooting', topicId: 'uploads', date: '2026-08-22' },
  { id: 'r9', type: 'article', audience: 'teams', title: 'Introduction to evidence and audit trails', description: 'Building an auditable process for routine technical tasks.', topic: 'Reporting', date: '2026-08-19', minutes: 7 }
];
export const audiences = { all: 'All communities', customers: 'Customers', partners: 'Partners', teams: 'Internal teams' };
export const folders = [
  { id: 'operations', title: 'Data operations', description: 'Imports, uploads and release practices.' },
  { id: 'support', title: 'Support and services', description: 'Account questions and shared guidance.' }
];
export const topics = [
  { id: 'quality', folderId: 'operations', title: 'Data quality', description: 'Checking data before it reaches another system.' },
  { id: 'releases', folderId: 'operations', title: 'Release management', description: 'Practical checks for predictable changes.' },
  { id: 'uploads', folderId: 'operations', title: 'Troubleshooting', description: 'Understanding and resolving upload failures.' },
  { id: 'access', folderId: 'support', title: 'Account access', description: 'Questions about signing in and account details.' }
];
const postBodies = {
  r2: 'We are preparing a scheduled import into a fictional reporting system. Which checks would you run to confirm the file is complete and consistent before scheduling it?',
  r4: 'A user can open the public help articles but is having trouble signing in. What should we check before passing the query to the support team? Please keep any examples fictional.',
  r6: 'Our team is writing a release checklist for a fictional service. We already check the main user journeys and any data changes. What useful checks would you add?',
  r8: 'Our sample upload failed validation. The report mentions a missing column and an inconsistent date format. What would you investigate first?'
};
export const posts = resources.filter(r => r.type === 'discussion').map(r => ({
  ...r, authorId: 'demo-member', createdAt: `${r.date}T09:00:00Z`,
  body: postBodies[r.id]
}));
export const seedReplies = [
  { id: 'seed-1', postId: 'r2', authorId: 'demo-moderator', authorRole: 'moderator', createdAt: '2026-09-21T10:00:00Z', body: 'Start with a small test file and verify the required fields. This is a fictional moderator response.' },
  { id: 'seed-2', postId: 'r2', authorId: 'demo-member', authorRole: 'member', createdAt: '2026-09-24T09:00:00Z', body: 'We also compare the accepted and rejected record counts before scheduling the import.' },
  { id: 'seed-3', postId: 'r4', authorId: 'demo-member', authorRole: 'member', createdAt: '2026-09-23T09:00:00Z', body: 'Is there a checklist for investigating a sign-in problem without collecting personal information?' },
  { id: 'seed-4', postId: 'r6', authorId: 'demo-you', authorRole: 'member', createdAt: '2026-09-24T10:00:00Z', body: 'My own reply should not create a blue dot for me.' },
  { id: 'seed-5', postId: 'r8', authorId: 'demo-member', authorRole: 'member', createdAt: '2026-09-24T11:00:00Z', body: 'Our fictional upload was rejected because a required column was missing. What would you check first?' }
];
export const authorNames = { 'demo-you': 'You', 'demo-member': 'Alex Morgan', 'demo-moderator': 'Community moderator' };
export function articleParagraphs(item) {
  return [item.description, 'Start by checking the source information against a known example. Record what you expected, what happened, and which checks you performed.', 'Use a small test case before changing a wider process. Keep an audit trail of the result and ask the appropriate support team when the evidence is unclear.', 'This article is fictional portfolio content. It is not operational guidance for an employer service.'];
}
