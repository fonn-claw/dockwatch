---
phase: 4
slug: dashboard-seed-data-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full build must pass
- **Max feedback latency:** 12 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DEMO-01-09 | build | `npm run build` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | DEMO-01-09 | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | DASH-01-07 | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | DASH-01-07 | build | `npm run build` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 2 | DEMO-08-09 | build | `npm run build` | ✅ | ⬜ pending |
| 04-03-02 | 03 | 2 | DEMO-08-09 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard status cards show correct counts | DASH-01 | Requires seed data | Run seed, navigate to /dashboard, verify overdue/due-soon/on-track counts |
| Health scores are weighted correctly | DASH-02 | Calculation verification | Check health scores against expected values from seed data |
| Calendar shows colored dots on correct dates | DASH-03 | Visual verification | Navigate to /dashboard, check calendar dots match scheduled dates |
| Activity feed shows recent entries | DASH-04 | Visual verification | Verify 10 most recent audit entries appear |
| Seed data tells coherent story | DEMO-04 | Narrative verification | Browse all views, verify data consistency and realistic patterns |
| Mobile responsiveness | DEMO-08 | Device testing | View all pages at 375px width, verify no broken layouts |
| Professional UI quality | DEMO-09 | Visual verification | Review all pages for spacing, typography, color consistency |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 12s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
