import type { InterviewLocale } from "@/types/interview";

export interface InterviewUiCopy {
  tipLabel: string;
  tipBody: string;
  step1Title: string;
  step1Description: string;
  dropActive: string;
  dropIdle: string;
  dropBrowse: string;
  readingPdf: string;
  pastePlaceholder: string;
  step2Title: string;
  startInterview: string;
  startWithResume: string;
  startWithoutResume: string;
  parseFailed: string;
  interviewerLabel: string;
  interviewerTitle: string;
  todayDimensions: string;
  mainProbes: string;
  exit: string;
  interviewCompleteBanner: string;
  getMyReportBold: string;
  interviewCompleteSuffix: string;
  homeStretchBanner: string;
  evalPlaceholder: string;
  inputPlaceholder: string;
  inputClosingPlaceholder: string;
  send: string;
  getMyReport: string;
  endInterview: string;
  failedStart: string;
  failedSend: string;
  failedEnd: string;
  parseEvalFailed: string;
  noResponse: string;
  requestFailed: string;
  verdict: string;
  overallAssessment: string;
  overallScore: string;
  scoreOutOf: string;
  topStrength: string;
  priorityImprovement: string;
  diagnosis: string;
  dimensionBreakdown: string;
  tapExpand: string;
  tapCollapse: string;
  voiceInput: string;
  voiceListening: string;
  voiceUnsupported: string;
}

const EN: InterviewUiCopy = {
  tipLabel: "Tip:",
  tipBody:
    "Upload or paste your resume so the interviewer can ask about your specific experiences — closer to a real consulting interview.",
  step1Title: "Step 1 — Optional resume",
  step1Description:
    "Upload a PDF or paste text below. Skip this step to practice without a resume.",
  dropActive: "Drop PDF here",
  dropIdle: "Drag & drop resume PDF",
  dropBrowse: "or click to browse",
  readingPdf: "Reading PDF…",
  pastePlaceholder: "Or paste your resume text here…",
  step2Title: "Step 2 — Start interview",
  startInterview: "Start interview",
  startWithResume:
    "Partner-style flow: intro, resume deep-dive, randomized behavioral dimensions, then your questions for the interviewer.",
  startWithoutResume:
    "Same full flow without a resume — questions will build on what you share in your intro.",
  parseFailed: "Failed to parse PDF",
  interviewerLabel: "Interviewer",
  interviewerTitle: "Senior Consulting Partner",
  todayDimensions: "Today",
  mainProbes: "Main probes",
  exit: "Exit",
  interviewCompleteBanner: "Interview complete. Click",
  getMyReportBold: "Get my report",
  interviewCompleteSuffix: " for your dimension scores.",
  homeStretchBanner:
    "You are in the home stretch ({current} of {min}–{max} probes). The interviewer will close with your questions soon.",
  evalPlaceholder: "Your scored feedback report is ready — see below.",
  inputPlaceholder: "Type your answer…",
  inputClosingPlaceholder: "Ask the interviewer anything…",
  send: "Send",
  getMyReport: "Get my report",
  endInterview: "End interview",
  failedStart: "Failed to start interview",
  failedSend: "Failed to send",
  failedEnd: "Failed to end interview",
  parseEvalFailed: "Could not parse evaluation. Please try again.",
  noResponse: "No response from interviewer",
  requestFailed: "Request failed",
  verdict: "Verdict",
  overallAssessment: "Overall assessment",
  overallScore: "Overall score",
  scoreOutOf: "out of 10",
  topStrength: "Top strength",
  priorityImprovement: "Priority improvement",
  diagnosis: "Diagnosis",
  dimensionBreakdown: "Dimension breakdown",
  tapExpand: "Tap for details",
  tapCollapse: "Tap to collapse",
  voiceInput: "Voice input",
  voiceListening: "Listening… tap to stop",
  voiceUnsupported: "Voice input requires Chrome, Edge, or Safari",
};

const ZH: InterviewUiCopy = {
  tipLabel: "提示：",
  tipBody:
    "上传或粘贴简历，面试官会针对你的真实经历提问，更接近国内顶尖咨询公司的真人面试。",
  step1Title: "第一步 — 简历（可选）",
  step1Description:
    "上传 PDF 或在下方粘贴文本。也可跳过，仅根据你在开场时的口述经历提问。",
  dropActive: "松开以上传 PDF",
  dropIdle: "拖拽或点击上传简历 PDF",
  dropBrowse: "支持 PDF 格式",
  readingPdf: "正在读取 PDF…",
  pastePlaceholder: "或在此粘贴简历正文…",
  step2Title: "第二步 — 开始面试",
  startInterview: "开始面试",
  startWithResume:
    "完整流程：开场自我介绍 → 简历深挖 → 随机行为维度考察 → 向面试官提问收尾。",
  startWithoutResume:
    "无简历时流程相同，问题将基于你在开场介绍中分享的经历展开。",
  parseFailed: "PDF 解析失败",
  interviewerLabel: "面试官",
  interviewerTitle: "资深咨询合伙人",
  todayDimensions: "本场考察",
  mainProbes: "主问题",
  exit: "退出",
  interviewCompleteBanner: "面试已结束，请点击",
  getMyReportBold: "查看我的报告",
  interviewCompleteSuffix: "，查看各维度得分。",
  homeStretchBanner:
    "已进入收尾阶段（已完成 {current}/{min}–{max} 个主问题），面试官即将邀请你提问。",
  evalPlaceholder: "评分报告已生成，请见下方。",
  inputPlaceholder: "输入你的回答…",
  inputClosingPlaceholder: "向面试官提问…",
  send: "发送",
  getMyReport: "查看我的报告",
  endInterview: "结束面试",
  failedStart: "无法开始面试",
  failedSend: "发送失败",
  failedEnd: "结束面试失败",
  parseEvalFailed: "无法解析评分报告，请重试。",
  noResponse: "面试官无响应",
  requestFailed: "请求失败",
  verdict: "整体判断",
  overallAssessment: "综合评估",
  overallScore: "总分",
  scoreOutOf: "满分 10 分",
  topStrength: "最突出优点",
  priorityImprovement: "优先改进",
  diagnosis: "维度诊断",
  dimensionBreakdown: "维度得分",
  tapExpand: "点击展开说明",
  tapCollapse: "点击收起",
  voiceInput: "语音输入",
  voiceListening: "正在聆听… 点击停止",
  voiceUnsupported: "当前浏览器不支持语音输入，请使用 Chrome、Edge 或 Safari",
};

export function getInterviewUiCopy(locale: InterviewLocale): InterviewUiCopy {
  return locale === "zh" ? ZH : EN;
}

export const INTERVIEW_PAGE_COPY = {
  en: {
    backHome: "Back to home",
    backSetup: "← Back to setup",
    title: "Interview simulator",
    description:
      "Full consulting behavioral flow: intro, resume deep-dive, randomized dimension probes, and a closing Q&A — scored by competency, not by question.",
    tabEn: "English interview",
    tabZh: "中文面试",
    tablistLabel: "Interview language",
  },
  zh: {
    backHome: "返回首页",
    backSetup: "← 返回设置",
    title: "面试模拟",
    description:
      "还原顶尖咨询公司完整行为面试：开场、简历深挖、随机维度考察与收尾反问，按能力维度评分而非逐题打分。",
    tabEn: "English interview",
    tabZh: "中文面试",
    tablistLabel: "面试语言",
  },
} as const;
