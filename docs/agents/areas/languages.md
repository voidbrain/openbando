# Languages

Area notes for OpenBando ([index](../areas.md)). Read before you change this area; the rules and lessons here are as binding as AGENTS.md.

### Languages

- The templates stay in English. `I18nService` (`services/i18n.service.ts`) rewrites what the page shows (text nodes, `title`, `placeholder`, `aria-label`) through a dictionary (`src/app/i18n/<lang>.ts`) with a MutationObserver, keeps the English to restore it, and skips `textarea`, `svg`, `[contenteditable]` and `[translate="no"]` (the chat, the pilot's own text). Choice: saved setting (`abando-lang`) → browser language → English; the flag next to the version badge changes it.
- `core/i18n.ts` (pure, tested): exact entries, `{0}` patterns (holes may move), and " · " lists translated part by part. New UI text: add its Italian to `i18n/it.ts`; `npm run check:i18n` (also in CI) lists what is missing: static template text, `title` / `aria-label` / `placeholder`, bound strings, toasts and `tr()`, checked with the app's own `translate()`. The app translates each text node on its own, so text split by an inline element (`Press <b>New</b>, then…`) needs a key per piece. Text that stays English on purpose goes in `tools/i18n/keep-english.txt`. Text built in code elsewhere is still only seen at run time (`I18nService.missing`). Native `confirm` / `prompt` text goes through `tr()`.
- The AI answers in the chosen language: `replyLanguage(lang)` is appended to `SYSTEM_PROMPT` and `BLOCK_PROMPT`; JSON keys and command names stay English.
