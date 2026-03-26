---
phase: 2
slug: assets-work-orders
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must pass
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ASSET-01-05 | build | `npm run build` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | ASSET-01-05 | build | `npm run build` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | WO-01-07 | build | `npm run build` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | WO-01-07 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Asset table renders with sortable columns | ASSET-01 | Visual verification | Navigate to /assets, verify table columns and sort |
| Work order cards display status badges | WO-01 | Visual verification | Navigate to /work-orders, verify card layout |
| Status transition dropdown shows valid options | WO-02 | Interactive verification | Open work order detail, check available transitions |
| Mobile layout stacks cards properly | WO-07 | Device testing | View work orders at 375px width |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
