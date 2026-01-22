# i18n Implementation Task List

## Project: C3i Backup ONE - Internationalization

---

## Setup Tasks

- [x] Install i18next dependencies (i18next, react-i18next)
- [x] Create i18n configuration file
- [x] Create translation file structure (en.json, es.json)
- [x] Initialize i18n in app root
- [x] Add language switcher component (in Settings page)

---

## Translation Tasks by Module

### 1. Authentication Module (3 files) ✅

#### File: `app/client/modules/auth/routes/login.tsx`
- [x] Page metadata (title, description)
- [x] Two-Factor Authentication section (title, description, labels, buttons)
- [x] Login form (title, description, labels, placeholders, buttons, links)
- [x] Toast messages (4 messages)

#### File: `app/client/modules/auth/routes/onboarding.tsx`
- [x] Page metadata (title, description)
- [x] Welcome layout (title, description)
- [x] Form fields (email, username, password, confirm password)
- [x] Form labels, placeholders, and descriptions
- [x] Validation messages
- [x] Toast messages (2 messages)

#### File: `app/client/modules/auth/components/reset-password-dialog.tsx`
- [x] Dialog title and descriptions (Tauri/Web variants)
- [x] Command hints and instructions

---

### 2. Volumes Module (6 files) ✅

#### File: `app/client/modules/volumes/routes/volumes.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumb
- [x] Empty state (title, description, button)
- [x] Search and filter UI (placeholders, options)
- [x] Table headers
- [x] Status labels and counters

#### File: `app/client/modules/volumes/components/create-volume-form.tsx`
- [x] Form field labels and descriptions
- [x] Backend select options and tooltips
- [x] Test connection button states
- [x] Save button

#### File: `app/client/modules/volumes/components/volume-forms/directory-form.tsx`
- [x] Labels (Directory Path, Selected path)
- [x] Buttons (Change)
- [x] Descriptions

#### File: `app/client/modules/volumes/components/volume-forms/nfs-form.tsx`
- [x] Labels (Server, Export Path, Port, Version, Read-only)
- [x] Placeholders and descriptions

#### File: `app/client/modules/volumes/components/volume-forms/smb-form.tsx`
- [x] Labels (Server, Share, Username, Password, Version, Domain, Port, Read-only)
- [x] Placeholders and descriptions

#### File: `app/client/modules/volumes/components/volume-forms/webdav-form.tsx`
- [x] Labels (Server, Path, Username, Password, Port, SSL, Read-only)
- [x] Placeholders and descriptions

#### File: `app/client/modules/volumes/components/volume-forms/sftp-form.tsx`
- [x] Labels (Host, Port, Username, Password, Private Key, Path, Skip Host Key, Known Hosts)
- [x] Placeholders and descriptions

#### File: `app/client/modules/volumes/components/volume-forms/rclone-form.tsx`
- [x] Labels (Remote, Path, Read-only)
- [x] No remotes alert
- [x] Placeholders and descriptions

---

### 3. Repositories Module (10 files) ✅

#### File: `app/client/modules/repositories/routes/repositories.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumb
- [x] Empty state (title, description, button)
- [x] Search and filter UI (placeholders, options for status and backends)
- [x] Table headers (Name, Backend, Compression, Status)
- [x] Status labels and counters

#### File: `app/client/modules/repositories/components/create-repository-form.tsx`
- [x] Form field labels and descriptions
- [x] Backend select options
- [x] Compression mode options
- [x] Import existing repository checkbox
- [x] Password options

#### File: `app/client/modules/repositories/components/repository-forms/s3-repository-form.tsx`
- [x] S3-specific labels (Endpoint, Bucket, Access Key ID, Secret Access Key)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/local-repository-form.tsx`
- [x] Labels (Directory)
- [x] Warning dialog content
- [x] Browser dialog content

#### File: `app/client/modules/repositories/components/repository-forms/sftp-repository-form.tsx`
- [x] Labels (Host, Port, User, Path, Private Key, Skip Host Key, Known Hosts)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/gcs-repository-form.tsx`
- [x] Labels (Bucket, Project ID, Credentials JSON)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/azure-repository-form.tsx`
- [x] Labels (Container, Account Name, Account Key, Endpoint Suffix)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/r2-repository-form.tsx`
- [x] Labels (Endpoint, Bucket, Access Key ID, Secret Access Key)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/rclone-repository-form.tsx`
- [x] Labels (Remote, Path)
- [x] No remotes alert
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/rest-repository-form.tsx`
- [x] Labels (URL, Path, Username, Password)
- [x] Placeholders and descriptions

#### File: `app/client/modules/repositories/components/repository-forms/advanced-tls-form.tsx`
- [x] Labels (Upload/Download Limit, Insecure TLS, CA Certificate)
- [x] Tooltips and descriptions

---

### 4. Backups Module (4 files) ✅

#### File: `app/client/modules/backups/routes/backups.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumb
- [x] Empty state (title, description, button)
- [x] Loading messages
- [x] Card text

#### File: `app/client/modules/backups/routes/create-backup.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumbs (Backups, Create)
- [x] Loading messages
- [x] Empty state (title, description)
- [x] Select volume UI
- [x] Toast messages (2 messages)

#### File: `app/client/modules/backups/routes/backup-details.tsx`
- [ ] Page metadata (title, description)
- [ ] Detail page content

#### File: `app/client/modules/backups/components/backup-card.tsx`
- [x] Card labels (Schedule, Last backup, Next backup)

#### File: `app/client/modules/backups/components/create-schedule-form.tsx`
- [x] Weekly day labels (Monday-Sunday)
- [x] Form labels and descriptions (all 80+ strings)
- [x] Automation section
- [x] Frequency options
- [x] Backup paths section
- [x] Exclude patterns section
- [x] Retention policy section
- [x] Schedule summary section

---

### 5. Notifications Module (10 files) ✅

#### File: `app/client/modules/notifications/routes/notifications.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumb
- [x] Empty state (title, description, button)
- [x] Search and filter UI (placeholders, type options, status options)
- [x] Table headers (Name, Type, Status)
- [x] Status labels (Enabled, Disabled)
- [x] Status counters

#### File: `app/client/modules/notifications/components/create-notification-form.tsx`
- [x] Form field labels and descriptions
- [x] Type select options

#### File: `app/client/modules/notifications/components/notification-forms/email-form.tsx`
- [x] Email-specific labels (SMTP Host, SMTP Port, Username, Password, From/To addresses, Use TLS)
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/discord-form.tsx`
- [x] Discord-specific labels (Webhook URL, Username, Avatar URL, Thread ID)
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/slack-form.tsx`
- [x] Slack-specific labels (Webhook URL, Channel, Username, Icon Emoji)
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/gotify-form.tsx`
- [x] Gotify-specific labels (Server URL, Token, Priority, Path)
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/ntfy-form.tsx`
- [x] Ntfy-specific labels (Server URL, Topic, Username, Password, Access Token, Priority)
- [x] Priority options
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/pushover-form.tsx`
- [x] Pushover-specific labels (User Key, API Token, Devices, Priority)
- [x] Priority options
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/telegram-form.tsx`
- [x] Telegram-specific labels (Bot Token, Chat ID)
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/generic-form.tsx`
- [x] Generic webhook labels (URL, Method, Content Type, Headers, JSON options)
- [x] Request preview section
- [x] Placeholders and descriptions

#### File: `app/client/modules/notifications/components/notification-forms/custom-form.tsx`
- [x] Shoutrrr URL label
- [x] Placeholders and descriptions

---

### 6. Settings Module (9 files - ALL COMPLETE ✅)

#### File: `app/client/modules/settings/routes/settings.tsx`
- [x] Page metadata (title, description)
- [x] Breadcrumb
- [x] Account Information section (title, description, labels)
- [x] Change Password section (title, description, labels, helper text, button)
- [x] Backup Recovery Key section (title, description, helper text, button)
- [x] Dialog (title, description, labels, buttons)
- [x] Toast messages (7 messages - including logout failed)

#### File: `app/client/modules/settings/components/language-section.tsx`
- [x] Language switcher component created
- [x] Language selection (English/Spanish)
- [x] Section title and description

#### File: `app/client/modules/settings/components/app-settings-section.tsx`
- [x] Section title and description
- [x] Setting labels (Launch at startup, Desktop notifications)
- [x] Setting descriptions
- [x] Tip text
- [x] Toast messages (4 messages)

#### File: `app/client/modules/settings/components/two-factor-section.tsx`
- [x] Section title and description
- [x] Status label and values (Enabled, Disabled)
- [x] Helper text
- [x] Buttons (Enable 2FA, Backup Codes, Disable 2FA)

#### File: `app/client/modules/settings/components/windows-service-section.tsx`
- [x] Section title and description
- [x] Status label and values (Running, Stopped, Not Installed, Unknown)
- [x] Helper texts
- [x] Buttons (Install/Uninstall/Start/Stop Service, Open Service UI, Restart to Switch)
- [x] Current Connection section
- [x] Badge labels (Service Mode, Desktop Mode)
- [x] Port label
- [x] Warning messages
- [x] Toast messages (8 messages)

#### File: `app/client/modules/settings/components/log-viewer-section.tsx`
- [x] Section title and description
- [x] Buttons (Refresh, Open Folder)
- [x] Select options (Last 50/100/200/500/1000 lines)
- [x] Loading and empty state messages

#### File: `app/client/modules/settings/components/two-factor-setup-dialog.tsx`
- [x] All 3 dialog steps (password, QR, verify)
- [x] Dialog titles, descriptions, labels
- [x] Buttons (Cancel, Continue, Back, Verify)
- [x] Toast messages (5 messages)

#### File: `app/client/modules/settings/components/two-factor-disable-dialog.tsx`
- [x] Dialog title and description
- [x] Form labels and placeholders
- [x] Buttons (Cancel, Disable 2FA)
- [x] Toast messages (3 messages)

#### File: `app/client/modules/settings/components/backup-codes-dialog.tsx`
- [x] Dialog title and description
- [x] Form labels and placeholders
- [x] Buttons (Generate, Close)
- [x] Toast messages (3 messages)

---

### 7. Layout & Navigation Components (4 files) ✅

#### File: `app/client/components/layout.tsx`
- [x] Welcome text
- [x] Logout button
- [x] Logout failed toast

#### File: `app/client/components/app-sidebar.tsx`
- [x] Logo alt text
- [x] Sidebar title
- [x] Navigation items (Volumes, Repositories, Backups, Notifications, Settings)
- [x] Version tooltip labels (Restic, Rclone, Shoutrrr)
- [x] Update button text

#### File: `app/client/components/titlebar.tsx`
- [x] Window title
- [x] Button titles (Minimize, Restore, Maximize, Close)

#### File: `app/client/components/empty-state.tsx`
- [x] Component receives title/description as props (handled in parent components)

---

## Common Strings (Cross-cutting) ✅

### Form Labels & Buttons
- [x] Cancel
- [x] Download
- [x] Change
- [x] Save
- [x] Delete
- [x] Edit
- [x] Create
- [x] Enable
- [x] Disable
- [x] Refresh
- [x] Clear filters
- [x] Open Folder

### Status Labels
- [x] Enabled
- [x] Disabled
- [x] Running
- [x] Stopped
- [x] Healthy
- [x] Error
- [x] Unknown
- [x] Mounted
- [x] Unmounted

### Time/Schedule Labels
- [x] Days of week (Monday - Sunday)
- [x] Last backup
- [x] Next backup
- [x] Schedule

### Toast Message Patterns
- [x] Success messages (created, updated, deleted, downloaded)
- [x] Error messages (failed to create/update/delete)
- [x] Validation messages (passwords don't match, minimum length, required fields)

---

## Technical Implementation Checklist

### Phase 1: Setup (Required) ✅
- [x] Install `i18next` and `react-i18next`
- [x] Create `app/client/i18n/config.ts`
- [x] Create `app/client/i18n/locales/en.json`
- [x] Create `app/client/i18n/locales/es.json`
- [x] Add i18n initialization to app entry point
- [x] Add language persistence to localStorage
- [x] Test language switching mechanism

### Phase 2: Extract & Replace (Per Module) ✅
- [x] Authentication module (login, onboarding, reset-password)
- [x] Volumes module (main routes and ALL forms)
- [x] Repositories module (main routes and ALL forms)
- [x] Backups module (main routes, card, and schedule form)
- [x] Notifications module (main route and ALL forms)
- [x] Settings module (all 9 files including language switcher)
- [x] Layout & Navigation components

### Phase 3: Spanish Translation ✅
- [x] Translate all English keys to Spanish (Spain variant)
- [x] Review context-specific translations
- [ ] Test all UI screens with Spanish locale

### Phase 4: Testing & QA
- [ ] Test all pages in English
- [ ] Test all pages in Spanish
- [ ] Verify form validation messages
- [ ] Verify toast notifications
- [ ] Test page metadata (titles, descriptions)
- [ ] Check for layout issues with longer Spanish text

---

## Remaining Work

### Detail pages to translate:
- [ ] `app/client/modules/backups/routes/backup-details.tsx`
- [ ] Volume detail pages (if any)
- [ ] Repository detail pages (if any)
- [ ] Notification detail pages (if any)

---

## Translation Notes

### Spanish (Spain) Specifics
- Use formal "usted" form where appropriate for professional context
- Use "vosotros" instead of "ustedes" for plural informal (Spain variant)
- Technical terms: Consider whether to translate or keep English (e.g., "backup" vs "copia de seguridad")
- Date/time formats: Spanish uses DD/MM/YYYY
- Number formats: Use comma for decimals, period for thousands

### String Key Naming Convention
Use hierarchical dot notation:
- `auth.login.title`
- `auth.login.form.username`
- `volumes.empty.title`
- `common.button.cancel`
- `toast.success.created`

---

## Estimated Counts

- **Total files modified**: ~40 files
- **Estimated translation keys**: 500+ strings
- **Modules**: 7 major modules
- **Common components**: 5-10 reusable components
- **Completed**: ~95% of main functionality

---

## Additional Considerations

- [x] Added language preference to Settings page
- [x] Language preference stored in localStorage
- [x] Language persists across sessions
- [ ] Handle dynamic content (e.g., error messages from API)
- [ ] Consider RTL support for future languages (not needed for Spanish)

---

## Priority Order

1. **High Priority**: Authentication, Settings (user-facing critical features) ✅
2. **Medium Priority**: Volumes, Repositories, Backups (main functionality) ✅
3. **Low Priority**: Detail pages (secondary features) - Remaining
