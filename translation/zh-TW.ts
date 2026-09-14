import { IDType } from 'mobx-restful';

export default {
  welcome_to: '歡迎使用',
  get_started_by_editing: '開始你的專案吧，編輯',
  upstream_projects: '上游專案',
  home_page: '主頁',
  source_code: '源代碼',
  component: '元件',
  pagination: '分頁',
  powered_by: '強力驅動自',
  documentation: '文檔',
  documentation_summary: '查找有關 Next.js 功能和 API 的深入資訊。',
  learn: '學習',
  learn_summary: '在帶有測驗的交互式課程中了解 Next.js！',
  examples: '示例',
  examples_summary: '發現和部署示例 Next.js 專案。',
  deploy: '部署',
  deploy_summary: '使用 Vercel 立即將您的 Next.js 站點部署到公共 URL。',

  // Pagination Table
  create: '新增',
  view: '查看',
  submit: '提交',
  cancel: '取消',
  edit: '編輯',
  delete: '刪除',
  total_x_rows: ({ totalCount }: { totalCount: number }) =>
    `共 ${totalCount} 行`,
  sure_to_delete_x: ({ keys }: { keys: IDType[] }) =>
    `您確定刪除 ${keys.join('、')} 嗎？`,
  repository_name: '倉庫名',
  programming_language: '編程語言',
  topic: '話題',
  star_count: '星標數',
  description: '描述',

  // Scroll List
  scroll_list: '滾動列表',
  load_more: '加載更多……',
  no_more: '沒有更多',

  // MDX Article
  article: '文章',

  // Session
  session: '會話',
  register: '註冊',
  login: '登入',
  email: '郵箱',
  password: '密碼',
  otp_code: '驗證碼',
  please_enter_email: '請輸入郵箱',
  please_enter_password: '請輸入密碼',
  please_enter_otp: '請輸入驗證碼',
  send_otp: '發送驗證碼',
  webauthn: 'WebAuthn',
  email_required_for_otp: '電子郵箱是發送驗證碼的必填項',
  otp_sent_to_email: '驗證碼已發送到您的郵箱，請填入密碼框並點擊登入',
  registration_success_please_login: '註冊成功，請登入',
  webauthn_credentials: '安全憑證',
  webauthn_credentials_description: '綁定目前裝置的 U 盾、指紋、人臉等安全憑證',
  webauthn_credentials_empty:
    '在目前裝置綁定 U 盾、指紋、人臉等安全憑證，以便下次一鍵登入',
  credential_synced: '已同步',
  user_verified: '已驗證',
} as const;
