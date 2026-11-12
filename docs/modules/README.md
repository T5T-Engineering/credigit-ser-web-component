# Module docs — @credigit/web-ui

Per-module requirements and implementation notes (project invariant 14). Modules are the component groups in `src/components/<group>` plus `brand` (brand engine, tokens, theming). Component APIs are defined in [CONVENTIONS.md](../CONVENTIONS.md); visual rules in [BOLT-DESIGN.md](../BOLT-DESIGN.md).

| Module | Purpose | Status | Requirements | Implementation | Counterpart |
|---|---|---|---|---|---|
| `basic` | Basic components | Built | [REQUIREMENTS](./basic/REQUIREMENTS.md) | [IMPLEMENTATION](./basic/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend, credigit-ser-landing |
| `forms` | Form controls | Built | [REQUIREMENTS](./forms/REQUIREMENTS.md) | [IMPLEMENTATION](./forms/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend, credigit-ser-landing (demo-request form) |
| `layouts` | Layouts | Built | [REQUIREMENTS](./layouts/REQUIREMENTS.md) | [IMPLEMENTATION](./layouts/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend (`AppShell`), credigit-ser-landing (`Site`, `Band`) |
| `navigation` | Navigation | Built | [REQUIREMENTS](./navigation/REQUIREMENTS.md) | [IMPLEMENTATION](./navigation/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend (`SideNav`), credigit-ser-landing (`Navbar`, `PageFooter`) |
| `blocks` | UI blocks | Built | [REQUIREMENTS](./blocks/REQUIREMENTS.md) | [IMPLEMENTATION](./blocks/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend, credigit-ser-landing |
| `data-viz` | Data visualisation | Built | [REQUIREMENTS](./data-viz/REQUIREMENTS.md) | [IMPLEMENTATION](./data-viz/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend (dashboards, 360 RAR) |
| `data` | Data components | Built | [REQUIREMENTS](./data/REQUIREMENTS.md) | [IMPLEMENTATION](./data/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend |
| `utilities` | Utilities | Built | [REQUIREMENTS](./utilities/REQUIREMENTS.md) | [IMPLEMENTATION](./utilities/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend (tenant branding settings) |
| `app` | Application chrome and workflow UI | Built | [REQUIREMENTS](./app/REQUIREMENTS.md) | [IMPLEMENTATION](./app/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend |
| `operations` | Operations controls | Built | [REQUIREMENTS](./operations/REQUIREMENTS.md) | [IMPLEMENTATION](./operations/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend (Operations / Rules / Templates / Extensions screens); backend: credigit-ser-core-backend; templates: credigit-ser-notification-service |
| `brand` | Brand engine and theming | Built | [REQUIREMENTS](./brand/REQUIREMENTS.md) | [IMPLEMENTATION](./brand/IMPLEMENTATION.md) | Consumers: credigit-ser-frontend, credigit-ser-landing (root layout); brand source: `../brand-kit/` |

## Cross-cutting notes

- Permissions, workflows, notifications, audit and domain events are not applicable inside a UI library; consuming apps enforce them (invariants 9 and 12).
- Literal defaults standing in for business rules are registered in [TECH-DEBT.md](../../TECH-DEBT.md) (TD ids referenced in the code); the Google Fonts call and brand storage are recorded in [integration-points.md](../integration-points.md).
- README › Structure lists only seven groups (missing `data`, `app`, `operations`).
