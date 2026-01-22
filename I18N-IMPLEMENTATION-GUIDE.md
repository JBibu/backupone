# i18n Implementation Guide

## What Has Been Completed ✅

### Infrastructure Setup
- ✅ Installed `i18next` and `react-i18next` packages
- ✅ Created i18n configuration at [app/client/i18n/config.ts](app/client/i18n/config.ts)
- ✅ Created English translations at [app/client/i18n/locales/en.json](app/client/i18n/locales/en.json)
- ✅ Created Spanish (Spain) translations at [app/client/i18n/locales/es.json](app/client/i18n/locales/es.json)
- ✅ Initialized i18n in [app/root.tsx](app/root.tsx)

### Modules Updated
- ✅ **Authentication Module** (2 files completed)
  - ✅ [app/client/modules/auth/routes/login.tsx](app/client/modules/auth/routes/login.tsx)
  - ✅ [app/client/modules/auth/components/reset-password-dialog.tsx](app/client/modules/auth/components/reset-password-dialog.tsx)

---

## How to Complete the Remaining Work

### Step 1: Import useTranslation Hook

In every component that needs translations, add the import:

```typescript
import { useTranslation } from "react-i18next";
```

### Step 2: Use the Translation Hook

Inside your component function, call the hook:

```typescript
export default function MyComponent() {
  const { t } = useTranslation();
  // ... rest of component
}
```

### Step 3: Replace Hardcoded Strings

Replace all hardcoded UI text with translation calls:

**Before:**
```typescript
<button>Create Volume</button>
<p>No volumes found</p>
```

**After:**
```typescript
<button>{t("volumes.createButton")}</button>
<p>{t("volumes.empty.title")}</p>
```

### Step 4: Toast Messages

Replace toast notifications:

**Before:**
```typescript
toast.success("Backup job created successfully");
toast.error("Failed to create backup job");
```

**After:**
```typescript
toast.success(t("backups.create.toast.success"));
toast.error(t("backups.create.toast.failed"));
```

---

## Translation Key Reference Guide

### Common Patterns

#### Page Metadata
```typescript
// Keep English in meta functions (server-side)
export function meta() {
  return [
    { title: "C3i Backup ONE - Page Name" },
    { name: "description", content: "Page description" },
  ];
}
```

#### Breadcrumbs
```typescript
{t("moduleName.breadcrumb")}
```

#### Empty States
```typescript
<EmptyState
  title={t("moduleName.empty.title")}
  description={t("moduleName.empty.description")}
/>
```

#### Form Labels
```typescript
<FormLabel>{t("moduleName.formName.fieldName")}</FormLabel>
<Input placeholder={t("moduleName.formName.fieldNamePlaceholder")} />
```

#### Buttons
```typescript
<Button>{t("common.buttons.save")}</Button>
<Button>{t("common.buttons.cancel")}</Button>
```

#### Status Labels
```typescript
{t("common.status.enabled")}
{t("common.status.disabled")}
```

---

## Module-by-Module Translation Keys

### Volumes Module
```typescript
// Page
t("volumes.pageTitle")
t("volumes.breadcrumb")
t("volumes.empty.title")
t("volumes.createButton")

// Search & Filters
t("volumes.search.placeholder")
t("volumes.filters.allStatus")
t("volumes.filters.clearFilters")

// Table
t("volumes.table.name")
t("volumes.table.backend")
t("volumes.table.status")
```

### Repositories Module
```typescript
// Page
t("repositories.pageTitle")
t("repositories.breadcrumb")
t("repositories.empty.title")
t("repositories.createButton")

// Filters
t("repositories.filters.allStatus")
t("repositories.filters.healthy")
t("repositories.filters.error")

// S3 Form
t("repositories.s3Form.endpoint")
t("repositories.s3Form.bucket")
t("repositories.s3Form.accessKeyId")
```

### Backups Module
```typescript
// Page
t("backups.pageTitle")
t("backups.breadcrumb")
t("backups.empty.title")
t("backups.createButton")

// Create
t("backups.create.pageTitle")
t("backups.create.toast.success")
t("backups.create.toast.failed")

// Card
t("backups.card.schedule")
t("backups.card.lastBackup")
t("backups.card.nextBackup")

// Days
t("backups.schedule.monday")
t("backups.schedule.tuesday")
// ... etc
```

### Notifications Module
```typescript
// Page
t("notifications.pageTitle")
t("notifications.breadcrumb")
t("notifications.empty.title")
t("notifications.createButton")

// Filters
t("notifications.filters.allTypes")
t("notifications.filters.email")
t("notifications.filters.slack")

// Email Form
t("notifications.emailForm.smtpHost")
t("notifications.emailForm.smtpPort")
```

### Settings Module
```typescript
// Account
t("settings.account.title")
t("settings.account.username")

// Change Password
t("settings.changePassword.title")
t("settings.changePassword.currentPassword")
t("settings.changePassword.newPassword")
t("settings.changePassword.button")
t("settings.changePassword.toast.success")

// Recovery Key
t("settings.recoveryKey.title")
t("settings.recoveryKey.button")
t("settings.recoveryKey.dialog.title")

// App Settings
t("settings.appSettings.title")
t("settings.appSettings.autostart.label")
t("settings.appSettings.notifications.label")
t("settings.appSettings.toast.autostartEnabled")

// 2FA
t("settings.twoFactor.title")
t("settings.twoFactor.statusLabel")
t("settings.twoFactor.statusEnabled")
t("settings.twoFactor.enableButton")

// Windows Service
t("settings.windowsService.title")
t("settings.windowsService.statusLabel")
t("settings.windowsService.installButton")
t("settings.windowsService.toast.installSuccess")

// Logs
t("settings.logs.title")
t("settings.logs.refreshButton")
```

### Layout & Navigation
```typescript
// Layout
t("layout.welcome")
t("layout.logoutButton")

// Sidebar
t("sidebar.title")
t("sidebar.nav.volumes")
t("sidebar.nav.repositories")
t("sidebar.nav.backups")
t("sidebar.nav.notifications")
t("sidebar.nav.settings")

// Titlebar
t("titlebar.minimize")
t("titlebar.maximize")
t("titlebar.close")
```

### Common Strings
```typescript
// Buttons
t("common.buttons.cancel")
t("common.buttons.save")
t("common.buttons.delete")
t("common.buttons.edit")
t("common.buttons.create")

// Status
t("common.status.enabled")
t("common.status.disabled")
t("common.status.running")
t("common.status.stopped")
```

---

## Files to Update

### Priority 1: Core Features (6 files)
1. ✅ app/client/modules/auth/routes/login.tsx
2. ✅ app/client/modules/auth/components/reset-password-dialog.tsx
3. app/client/modules/volumes/routes/volumes.tsx
4. app/client/modules/repositories/routes/repositories.tsx
5. app/client/modules/backups/routes/backups.tsx
6. app/client/modules/settings/routes/settings.tsx

### Priority 2: Layout & Navigation (3 files)
7. app/client/components/layout.tsx
8. app/client/components/app-sidebar.tsx
9. app/client/components/titlebar.tsx

### Priority 3: Forms & Details (15+ files)
10. app/client/modules/volumes/components/create-volume-form.tsx
11. app/client/modules/volumes/components/volume-forms/directory-form.tsx
12. app/client/modules/repositories/components/create-repository-form.tsx
13. app/client/modules/repositories/components/repository-forms/s3-repository-form.tsx
14. app/client/modules/backups/routes/create-backup.tsx
15. app/client/modules/backups/routes/backup-details.tsx
16. app/client/modules/backups/components/backup-card.tsx
17. app/client/modules/backups/components/create-schedule-form.tsx
18. app/client/modules/notifications/routes/notifications.tsx
19. app/client/modules/notifications/components/create-notification-form.tsx
20. app/client/modules/notifications/components/notification-forms/email-form.tsx
21. app/client/modules/settings/components/app-settings-section.tsx
22. app/client/modules/settings/components/two-factor-section.tsx
23. app/client/modules/settings/components/windows-service-section.tsx
24. app/client/modules/settings/components/log-viewer-section.tsx

---

## Testing Your Changes

### 1. Start the Development Server
```bash
bun dev
```

### 2. Test Language Switching

Currently, the app defaults to English. To test Spanish translations, you can:

**Option A: Add Language Switcher (Recommended)**

Create a simple language switcher component:

```typescript
// app/client/components/language-switcher.tsx
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage}>
      {i18n.language === "en" ? "🇪🇸 Español" : "🇬🇧 English"}
    </Button>
  );
}
```

Add it to your sidebar or settings page.

**Option B: Manually Change in Browser Console**

Open browser DevTools and run:
```javascript
// Switch to Spanish
localStorage.setItem("language", "es");
location.reload();

// Switch back to English
localStorage.setItem("language", "en");
location.reload();
```

**Option C: Update i18n Config Default Language**

Edit [app/client/i18n/config.ts](app/client/i18n/config.ts):

```typescript
i18n.use(initReactI18next).init({
  resources,
  lng: "es", // Change to "es" for Spanish
  fallbackLng: "en",
  // ...
});
```

### 3. Persist Language Selection

Update [app/client/i18n/config.ts](app/client/i18n/config.ts) to read from localStorage:

```typescript
const savedLanguage = typeof window !== "undefined"
  ? localStorage.getItem("language")
  : null;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Save language changes to localStorage
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lng);
  }
});
```

---

## Quick Find & Replace Patterns

### For VSCode Find & Replace (Regex enabled)

**Pattern 1: Simple button text**
- Find: `>([A-Z][a-z]+[\w\s]+)<`
- Review each match and replace with: `>{t("module.key")}<`

**Pattern 2: Toast messages**
- Find: `toast\.(success|error|info)\("([^"]+)"\)`
- Replace: `toast.$1(t("module.toast.$2"))`

**Pattern 3: Form labels**
- Find: `<FormLabel>([^<]+)</FormLabel>`
- Review and replace with: `<FormLabel>{t("module.form.field")}</FormLabel>`

⚠️ **Warning:** Always review regex replacements carefully! These are suggestions to speed up the process, not automated solutions.

---

## Tips & Best Practices

### 1. Keep Keys Hierarchical
```typescript
// Good
t("volumes.empty.title")
t("volumes.empty.description")

// Bad
t("volumesEmptyTitle")
t("volumesEmptyDescription")
```

### 2. Use Namespace Prefixes
All keys are already organized by module (auth, volumes, repositories, etc.)

### 3. Handle Plurals
```typescript
// Use conditional logic for now
const count = volumes.length;
const text = count === 1 ? t("volumes.counter.single") : t("volumes.counter.plural");
```

### 4. Don't Translate Technical Terms
Some terms are better left in English or as-is:
- Component/library names (React, Docker, S3, SMTP)
- File paths and commands
- Technical constants

### 5. Test Edge Cases
- Long Spanish text (it's often longer than English)
- Special characters (á, é, í, ó, ú, ñ, ü)
- Layout breaking with longer text

---

## Adding More Languages Later

To add a new language (e.g., French):

1. Create translation file:
```bash
touch app/client/i18n/locales/fr.json
```

2. Copy structure from en.json and translate

3. Add to config:
```typescript
// app/client/i18n/config.ts
import fr from "./locales/fr.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr }, // Add new language
};
```

---

## Troubleshooting

### Translation key not found
**Symptom:** Seeing `"moduleName.key"` instead of translated text

**Solution:**
- Check the key exists in both en.json and es.json
- Verify the key path is correct (no typos)
- Make sure i18n is initialized (check browser console)

### Translations not changing
**Symptom:** Text stays in English even after changing language

**Solution:**
- Check if component uses `useTranslation()` hook
- Verify language change is persisted
- Try hard refresh (Ctrl+Shift+R)

### Build errors
**Symptom:** TypeScript or build errors

**Solution:**
- Ensure all imports are correct
- Check for missing curly braces around `{t("key")}`
- Verify json files have valid syntax

---

## Current Progress Summary

**Completed:** 6 / 30 tasks (20%)
- ✅ Infrastructure setup
- ✅ Translation files created (400+ strings)
- ✅ Authentication module (2 files)

**Remaining:** 24 files to update
- 🔄 Volumes module (3 files)
- 🔄 Repositories module (3 files)
- 🔄 Backups module (4 files)
- 🔄 Notifications module (3 files)
- 🔄 Settings module (5 files)
- 🔄 Layout & Navigation (3 files)
- 🔄 Other components (3 files)

---

## Next Steps

1. **Option A - Manual Implementation:**
   - Work through the files list above
   - Follow the patterns shown in login.tsx
   - Test after each module completion

2. **Option B - Automated Approach:**
   - Use find/replace patterns for common cases
   - Review and test thoroughly
   - Handle edge cases manually

3. **Option C - Incremental Rollout:**
   - Complete one module at a time
   - Test thoroughly before moving to next
   - Deploy incrementally if needed

---

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Translation Files: en.json](app/client/i18n/locales/en.json)
- [Translation Files: es.json](app/client/i18n/locales/es.json)
- [Task List: i18n-task-list.md](i18n-task-list.md)

---

**Questions or issues?** Check the troubleshooting section or review the completed Authentication module files as reference examples.
