import test from "node:test"
import assert from "node:assert/strict"
import {
  diagnosticNavigationTarget,
  isCurrentDiagnosticResponse,
  removeFileDiagnostics,
  replaceFileDiagnostics,
} from "../src/utils/diagnosticState.ts"

const diagnostic = (file, line, column = 1) => ({
  file, severity: "error", code: "TEST", message: "test", startLine: line,
  startColumn: column, source: "test provider", category: "syntax",
})

test("outdated or cross-workspace diagnostic responses are rejected", () => {
  assert.equal(isCurrentDiagnosticResponse(1, 2, "project-a", "project-a", "file-a", "file-a", 1, 1), false)
  assert.equal(isCurrentDiagnosticResponse(2, 2, "project-b", "project-a", "file-a", "file-a", 2, 2), false)
  assert.equal(isCurrentDiagnosticResponse(2, 2, "project-a", "project-a", "file-a", "file-a", 1, 2), false)
  assert.equal(isCurrentDiagnosticResponse(2, 2, "project-a", "project-a", "file-a", "file-a", 2, 2), true)
})

test("new diagnostics replace a file result and deleting a file clears its stale markers", () => {
  const first = replaceFileDiagnostics([], "src/main.py", [diagnostic("src/main.py", 2)])
  const second = replaceFileDiagnostics(first, "src/main.py", [])
  assert.deepEqual(second, [])
  assert.deepEqual(removeFileDiagnostics([diagnostic("src/main.py", 2), diagnostic("src/other.py", 3)], "src/main.py"), [diagnostic("src/other.py", 3)])
})

test("problem navigation preserves the provider's line and column and skips unknown positions", () => {
  assert.deepEqual(diagnosticNavigationTarget(diagnostic("views.py", 8, 5)), { file: "views.py", line: 8, column: 5 })
  assert.equal(diagnosticNavigationTarget({ ...diagnostic("views.py", 8), startLine: undefined }), null)
})
