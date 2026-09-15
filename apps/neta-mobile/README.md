<p align="center">
  <img src="assets/logo/iconLogo.png" width="128" height="128" alt="Neta logo" />
</p>

<h1 align="center">Neta Mobile</h1>

<p align="center">
  A fast, accessible iOS and Android client for a self-hosted Neta workspace.
</p>

<p align="center">
  <strong>English</strong> · <a href="README.tr.md">Türkçe</a>
</p>

## About

Neta Mobile brings the owner workspace and the restricted client portal to
React Native. One universal binary connects at runtime to a compatible
self-hosted Neta domain or a secret-free `neta://connect` QR link. The app uses native navigation, modal
forms, system date and document pickers, secure session storage, light/dark
themes, reduced-motion support, and keyboard-safe form layouts.

The mobile product covers dashboards, clients, projects, tasks, calendar,
income/expense tracking, journal, AI chat, settings, localization, media, and
the client portal. Proposals, contracts, invoices, and subscriptions are
intentionally out of scope.

## Production status

The repository backend now exposes and tests the minimum owner read slice for
dashboard, clients, projects, tasks and calendar. Finance, journal, AI,
settings, files, portal parity and write operations remain planned. A store
release is still blocked on signed iOS/Android and two-live-instance evidence;
the client does not replace missing server data with mocks.

## Requirements

- Node.js 24 (`.nvmrc`)
- pnpm 11
- Xcode 26.4+ and Homebrew Ruby 3.4 for iOS
- JDK 17 and Android SDK 36 for Android
- A compatible Neta server with discovery and mobile `/api/v1` contracts

## Quick start

Run commands from the monorepo root:

```sh
pnpm install
cp apps/neta-mobile/.env.example apps/neta-mobile/.env
pnpm mobile:release:check
pnpm mobile:start:clear
```

Run a native development build in another terminal:

```sh
pnpm mobile:ios
# or
pnpm mobile:android
```

The development default targets localhost. A production universal build leaves
the origin empty and asks the user to connect a domain or scan the administrator's QR.

## Configuration

The production environment is required; the origin is optional:

```dotenv
EXPO_PUBLIC_APP_ENV=production
# Optional development/demo/fork default only:
EXPO_PUBLIC_NETA_ORIGIN=
```

App name, scheme, bundle identifiers, package name, version, and native build
numbers are configured through the `NETA_*` values documented in
[Customization](CUSTOMIZATION.md). Never place API keys, passwords, cookies,
or tokens in an `EXPO_PUBLIC_*` variable.

## Quality commands

```sh
pnpm mobile:release:check
pnpm --filter @neta/mobile doctor
pnpm --filter @neta/mobile instance:smoke
pnpm --filter @neta/mobile native:verify
pnpm audit --prod
```

`mobile:release:check` includes linting, strict TypeScript, unit tests, localization,
accessibility, redesign phase gates, native autolinking checks, fork config
validation, and the production release guard.

## Project layout

```text
apps/neta-mobile/        Expo Router application and native projects
  src/app/               Public, owner, portal, and modal form routes
  src/components/        Accessible UI, forms, navigation, and feedback
  src/features/          Domain clients, validation, and feature UI
packages/api-contracts/  Shared runtime API contracts
packages/design-tokens/  Platform-neutral design tokens
docs/mobile/             Architecture decisions, phase evidence, and runbooks
```

## Documentation

- [Customization and fork guide](CUSTOMIZATION.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Release runbook](../../docs/mobile/redesign-phase-12/fork-release-runbook.md)
- [Native and accessibility matrix](../../docs/mobile/redesign-phase-12/native-a11y-matrix.md)
- [Canonical redesign plan](../../docs/mobile/neta-mobile-redesign-master-plan.md)

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before
opening a pull request. Accessibility regressions, secrets in source control,
mocked production data, and unvalidated cross-tenant API responses are release
blockers.

## License

Neta Mobile is available under the [MIT License](LICENSE).
