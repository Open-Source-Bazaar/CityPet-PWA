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

  // MDX Article
  article: 'Article',

  // Session
  session: 'Session',
  register: 'Register',
  login: 'Login',
  email: 'Email',
  password: 'Password',
  otp_code: 'OTP Code',
  please_enter_email: 'Please enter email',
  please_enter_password: 'Please enter password',
  please_enter_otp: 'Please enter OTP code',
  send_otp: 'Send OTP',
  webauthn: 'WebAuthn',
  email_required_for_otp: 'Email is required to send verification code',
  otp_sent_to_email:
    'Verification code has been sent to your email, enter it in password box and click Login',
  registration_success_please_login: 'Registration successful, please login',
  webauthn_credentials: 'Security credentials',
  webauthn_credentials_description:
    'Bind this device with a USB key, fingerprint, face, or other security credential',
  webauthn_credentials_empty:
    'Bind a USB key, fingerprint, face, or other security credential on this device for one-click login next time',
  credential_synced: 'Synced',
  user_verified: 'Verified',
} as const;
