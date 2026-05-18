import type { ResumeLocale } from "@/types/resume";

export interface ResumeUiCopy {
  upload: string;
  results: string;
  analyzing: string;
  analyzingResume: string;
  dragDrop: string;
  dropHere: string;
  browseHint: string;
  lastFile: string;
  pdfUploaded: string;
  reupload: string;
  dropReplace: string;
  loadingResults: string;
  analysisFailed: string;
  verdict: string;
  overallAssessment: string;
  totalScore: string;
  scoreOutOf: string;
  diagnosis: string;
  dimensionBreakdown: string;
  action: string;
  whatNext: string;
  quickWinsTitle: string;
  detailedSuggestions: string;
  original: string;
  suggested: string;
  reason: string;
  tapExpand: string;
  tapCollapse: string;
  noDetail: string;
}

const EN: ResumeUiCopy = {
  upload: "Upload",
  results: "Results",
  analyzing: "Analyzing…",
  analyzingResume: "Analyzing resume…",
  dragDrop: "Drag & drop your resume PDF",
  dropHere: "Drop your PDF here",
  browseHint: "or click to browse · max 10 MB",
  lastFile: "Last file",
  pdfUploaded: "PDF uploaded",
  reupload: "Re-upload",
  dropReplace: "Drop to replace file",
  loadingResults: "Analysis in progress — results will appear here shortly.",
  analysisFailed: "Analysis failed",
  verdict: "Verdict",
  overallAssessment: "Overall assessment",
  totalScore: "Total score",
  scoreOutOf: "out of 10",
  diagnosis: "Diagnosis",
  dimensionBreakdown: "Dimension breakdown",
  action: "Action",
  whatNext: "What to do next",
  quickWinsTitle: "Quick wins — start here",
  detailedSuggestions: "Detailed suggestions",
  original: "Original",
  suggested: "Suggested",
  reason: "Reason",
  tapExpand: "Tap for details",
  tapCollapse: "Tap to collapse",
  noDetail: "No detail available.",
};

const ZH: ResumeUiCopy = {
  upload: "上传",
  results: "分析结果",
  analyzing: "分析中…",
  analyzingResume: "正在分析简历…",
  dragDrop: "拖拽或点击上传简历 PDF",
  dropHere: "松开以上传 PDF",
  browseHint: "支持 PDF · 最大 10 MB",
  lastFile: "上次文件",
  pdfUploaded: "已上传 PDF",
  reupload: "重新上传",
  dropReplace: "松开以替换文件",
  loadingResults: "正在分析，结果将显示在右侧…",
  analysisFailed: "分析失败",
  verdict: "整体判断",
  overallAssessment: "综合评估",
  totalScore: "总分",
  scoreOutOf: "满分 10 分",
  diagnosis: "维度诊断",
  dimensionBreakdown: "五项维度得分",
  action: "行动建议",
  whatNext: "下一步怎么改",
  quickWinsTitle: "快速改进 — 优先做这 3 条",
  detailedSuggestions: "详细修改建议",
  original: "原文",
  suggested: "建议修改",
  reason: "修改原因",
  tapExpand: "点击展开说明",
  tapCollapse: "点击收起",
  noDetail: "暂无详细说明。",
};

export function getResumeUiCopy(locale: ResumeLocale): ResumeUiCopy {
  return locale === "zh" ? ZH : EN;
}

export const RESUME_PAGE_COPY = {
  en: {
    backHome: "Back to home",
    title: "Resume optimizer",
    description:
      "Upload your PDF for consulting-specific feedback. English resumes are scored against MBB standards; Chinese resumes against top domestic consulting firms.",
    tabEn: "English resume",
    tabZh: "Chinese resume",
    tablistLabel: "Resume language",
    standardLabel: "MBB (McKinsey · BCG · Bain)",
    emptyHint:
      "Upload an English resume PDF to see MBB-focused scores and suggestions.",
  },
  zh: {
    backHome: "返回首页",
    title: "简历优化",
    description:
      "上传 PDF 获取咨询公司标准的简历反馈。英文简历按 MBB 标准评估；中文简历按国内顶尖咨询公司标准评估。",
    tabEn: "英文简历",
    tabZh: "中文简历",
    tablistLabel: "简历语言",
    standardLabel: "国内咨询（麦肯锡中国 · BCG 上海 · 罗兰贝格）",
    emptyHint: "上传中文简历 PDF，查看维度得分与修改建议。",
  },
} as const;

export const RESUME_API_ERRORS = {
  en: {
    noApiKey: "ANTHROPIC_API_KEY is not configured",
    noFile: "Please upload a PDF file",
    pdfOnly: "Only PDF files are supported",
    tooLarge: "File is too large (max 10 MB)",
    parseFailed:
      "Could not read this PDF. Export a text-based PDF from Word/Google Docs (not a photo scan), or remove password protection.",
    notEnoughText:
      "Not enough text extracted from the PDF. Use a text-based PDF (not a scanned image).",
    analyzeFailed: "Analysis failed. Please try again.",
  },
  zh: {
    noApiKey: "未配置 ANTHROPIC_API_KEY 环境变量",
    noFile: "请上传 PDF 文件",
    pdfOnly: "仅支持 PDF 格式",
    tooLarge: "文件过大（最大 10 MB）",
    parseFailed:
      "无法读取该 PDF。请用 Word / WPS / Google 文档导出文字版 PDF（非扫描件），并确保未加密。",
    notEnoughText: "未能从 PDF 中提取足够文字，请使用可选中文字的文字版 PDF。",
    analyzeFailed: "分析失败，请稍后重试。",
  },
} as const;
