# Integration points — @credigit/web-ui

Invariant 9 (connector-ready). The library is a UI component set: it makes no calls to Credigit backends, core banking, bureaus, regulators or messaging providers — consuming apps do that through their Connectors framework and pass data in as props. The only network traffic the library itself can cause is listed here.

| ID | Integration | Direction | Trigger | Payload / contract | Real-time / batch | Owning module | Notes |
|---|---|---|---|---|---|---|---|
| WC-INT-01 | Google Fonts CSS API (`https://fonts.googleapis.com/css2`) and font files (`https://fonts.gstatic.com`) | Outbound (browser → Google) | `applyBrand` / `brandBootScript` when the active brand font is not a bundled family (Baloo 2 is self-hosted and makes no request) | `GET css2?family=<validated family>:wght@400..800&display=swap` (static-weight fallback); one managed `<link id="cg-brand-font">` + preconnect | Real-time, on brand change / page load | `brand` (`src/brand/brand.ts`) | Apps must allow `style-src https://fonts.googleapis.com` and `font-src https://fonts.gstatic.com` in CSP and mention the call in the privacy notice. Family names validated by `isSafeFontFamily`. Not a Connectors-framework call: it is a browser resource load chosen by tenant brand configuration. |
| WC-INT-02 | Browser `localStorage` (brand persistence) | Local (browser) | `BrandProvider` with `persist` (default) | Serialised `BrandInput` under `credigit.brand` or `credigit.brand.<tenantId>` (`brandStorageKey`) | Real-time | `brand` | Not a remote integration; listed so tenant isolation of the stored brand is traceable (TD-009 closed). |

Identity & Access components (`SignInCard`, `MicrosoftSignInButton`, `OtpVerification`, `StepUpAuthDialog`, `PermissionMatrix`, `Can`) call nothing: sign-in, MSAL, `/api/v1/auth/*` and `/api/v1/identity/*` calls live in the consuming app (see `credigit-ser-core-backend/docs/api/identity-access.md`).
