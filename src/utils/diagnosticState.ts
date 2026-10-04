import type { SourceDiagnostic } from "../api/diagnostics"

const normalize = (path: string) => path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^\.\//, "")

export const isCurrentDiagnosticResponse = (
  requestId: number,
  latestRequestId: number,
  responseProjectId: string,
  expectedProjectId: string,
  responseFileId: string | null,
  expectedFileId: string,
  responseVersion: number,
  expectedVersion: number,
) => requestId === latestRequestId && responseProjectId === expectedProjectId && responseFileId === expectedFileId && responseVersion === expectedVersion

export const replaceFileDiagnostics = (current: SourceDiagnostic[], file: string, next: SourceDiagnostic[]) => [
  ...current.filter((item) => normalize(item.file) !== normalize(file)),
  ...next,
]

export const removeFileDiagnostics = (current: SourceDiagnostic[], file: string) =>
  current.filter((item) => normalize(item.file) !== normalize(file))

export const diagnosticNavigationTarget = (item: SourceDiagnostic) => item.startLine
  ? { file: item.file, line: item.startLine, column: item.startColumn || 1 }
  : null

