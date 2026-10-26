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
  load_more: 'Load more...',
  no_more: 'No more',

  // Authentication
  auth_checking: 'Checking your session...',
  auth_email: 'Email address',
  auth_phone: 'Phone number',
  auth_code: 'Verification code',
  auth_sent: 'Verification code sent. Please check for it.',
  auth_send: 'Send code',
  auth_submit: 'Sign in',
  auth_sign_out: 'Sign out',
  auth_user: 'User',
  auth_resend: 'Resend code',
  auth_change_account: 'Change account',
  auth_missing_verifier:
    'No verification callback was returned. Please send a new code.',
  auth_missing_session: 'No valid session was returned. Please try again.',
  cloudbase_config_required: 'Set NEXT_PUBLIC_CLOUDBASE_ENV to enable sign-in.',
  user_details: 'User details',
  user_display_name: 'Username',
  user_id: 'User ID',
  user_not_provided: 'Not provided',

  // MDX Article
  article: 'Article',
} as const;
