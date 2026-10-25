import { IDType } from 'mobx-restful';

export default {
  welcome_to: 'Welcome to',
  get_started_by_editing: 'Get started by editing',
  upstream_projects: 'Upstream projects',
  home_page: 'Home Page',
  source_code: 'Source Code',
  component: 'Component',
  pagination: 'Pagination',
  powered_by: 'Powered by',
  documentation: 'Documentation',
  documentation_summary:
    'Find in-depth information about Next.js features and API.',
  learn: 'Learn',
  learn_summary: 'Learn about Next.js in an interactive course with quizzes!',
  examples: 'Examples',
  examples_summary: 'Discover and deploy boilerplate example Next.js projects.',
  deploy: 'Deploy',
  deploy_summary:
    'Instantly deploy your Next.js site to a public URL with Vercel.',

  // Pagination Table
  create: 'Create',
  view: 'View',
  submit: 'Submit',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  total_x_rows: ({ totalCount }: { totalCount: number }) =>
    `Total ${totalCount} rows`,
  sure_to_delete_x: ({ keys }: { keys: IDType[] }) =>
    `Are you sure to delete ${keys.join(', ')}?`,
  repository_name: 'Repository Name',
  programming_language: 'Programming Language',
  topic: 'Topic',
  star_count: 'Star Count',
  description: 'Description',

  // Scroll List
  scroll_list: 'Scroll List',
  session: 'Sign in',
  email: 'Email',
  phone: 'Phone number',
  phone_format:
    'Enter the number with its country code, for example +8613800138000.',
  verification_code: 'Verification code',
  send_code: 'Send code',
  sending_code: 'Sending…',
  verify_and_sign_in: 'Verify and sign in',
  verifying: 'Verifying…',
  change: 'Change',
  code_sent: 'Verification code sent. Check your inbox or messages.',
  login_success: 'Signed in successfully.',
  sign_out: 'Sign out',
  signing_out: 'Signing out…',
  cloudbase_config_required: 'Set NEXT_PUBLIC_CLOUDBASE_ENV to enable sign-in.',
  authentication_failed: 'Authentication failed. Please try again.',
  load_more: 'Load more...',
  no_more: 'No more',

  // MDX Article
  article: 'Article',
} as const;
