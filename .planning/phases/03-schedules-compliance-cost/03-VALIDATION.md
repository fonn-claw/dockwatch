---
phase: 3
slug: schedules-compliance-cost
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

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
| 03-01-01 | 01 | 1 | SCHED-01-06 | build | `npm run build` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | SCHED-01-06 | build | `npm run build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | COMP-01-05 | build | `npm run build` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | COMP-01-05 | build | `npm run build` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 2 | COST-01-05 | build | `npm run build` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 2 | COST-01-05 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Schedule table renders with sortable columns | SCHED-01 | Visual verification | Navigate to /schedules, verify table columns and sort |
| Auto-generated work orders appear in list | SCHED-03 | Requires seed data + time passage | Create schedule with past due date, refresh, check /work-orders |
| Compliance dashboard shows status cards | COMP-01 | Visual verification | Navigate to /compliance, verify required/completed/overdue cards |
| PDF report downloads successfully | COMP-03 | File download verification | Click "Download Report" on compliance page, verify PDF opens |
| Audit trail shows all mutations | COMP-02 | Visual verification | Navigate to /compliance/audit, verify entries appear |
| Cost breakdown charts display correctly | COST-02 | Visual verification | Navigate to /reports, verify category breakdown |
| Budget vs actual bars show comparison | COST-04 | Visual verification | Navigate to /reports, verify budget progress bars |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
