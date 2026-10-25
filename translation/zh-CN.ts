import { IDType } from 'mobx-restful';

export default {
  welcome_to: '欢迎使用',
  get_started_by_editing: '开始你的项目吧，编辑',
  upstream_projects: '上游项目',
  home_page: '主页',
  source_code: '源代码',
  component: '组件',
  pagination: '分页',
  powered_by: '强力驱动自',
  documentation: '文档',
  documentation_summary: '查找有关 Next.js 功能和 API 的深入信息。',
  learn: '学习',
  learn_summary: '在带有测验的交互式课程中了解 Next.js！',
  examples: '示例',
  examples_summary: '发现和部署示例 Next.js 项目。',
  deploy: '部署',
  deploy_summary: '使用 Vercel 立即将您的 Next.js 站点部署到公共 URL。',

  // Pagination Table
  create: '新增',
  view: '查看',
  submit: '提交',
  cancel: '取消',
  edit: '编辑',
  delete: '删除',
  total_x_rows: ({ totalCount }: { totalCount: number }) =>
    `共 ${totalCount} 行`,
  sure_to_delete_x: ({ keys }: { keys: IDType[] }) =>
    `您确定删除 ${keys.join('、')} 吗？`,
  repository_name: '仓库名',
  programming_language: '编程语言',
  topic: '话题',
  star_count: '星标数',
  description: '描述',

  // Scroll List
  scroll_list: '滚动列表',
  session: '登录',
  email: '电子邮件',
  phone: '手机号码',
  phone_format: '请输入带国际区号的号码，例如 +8613800138000。',
  verification_code: '验证码',
  send_code: '发送验证码',
  sending_code: '正在发送……',
  verify_and_sign_in: '验证并登录',
  verifying: '正在验证……',
  change: '修改',
  code_sent: '验证码已发送，请查收。',
  login_success: '登录成功。',
  sign_out: '退出登录',
  signing_out: '正在退出……',
  cloudbase_config_required: '请配置 NEXT_PUBLIC_CLOUDBASE_ENV 以启用登录。',
  authentication_failed: '身份验证失败，请重试。',
  load_more: '加载更多……',
  no_more: '没有更多',

  // MDX Article
  article: '文章',
} as const;
