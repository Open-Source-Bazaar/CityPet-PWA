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
  load_more: '加载更多……',
  no_more: '没有更多',

  // Session
  session: '会话',
  register: '注册',
  login: '登录',
  email: '邮箱',
  password: '密码',
  please_enter_email: '请输入邮箱',
  please_enter_password: '请输入密码',
  send_otp: '发送验证码',
  webauthn: 'WebAuthn',
  email_required_for_otp: '电子邮箱是发送验证码的必填项',
  otp_sent_to_email: '验证码已发送到您的邮箱，请填入密码框并点击登录',
  registration_success_please_login: '注册成功，请登录',

  // MDX Article
  article: '文章',
} as const;
