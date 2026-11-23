# Practice English

A website for students in MOIA English classes to practice English.

## Pages

| Page | File |
| --- | --- |
| Welcome (Sign Up / Log In / About Us) | `index.html` |
| Sign Up | `signup.html` |
| Log In | `login.html` |
| Practice (topics, class code, translate) | `practice.html` + `practice.js` |

All pages share `styles.css`. Translations and the language menu are in `i18n.js`. Screenshots are in `screenshots/`.

To view it, open `index.html` in a browser.

## Not done yet

- Translations were written by AI. Have a native speaker check each language before students use it.
- Sign Up and Log In check the form, then go to Practice. No accounts are saved and no password is checked — there's no server. The name and email/phone are kept in the browser tab (sessionStorage) until it closes; the password is never kept.
- Topic buttons and General Practice don't go anywhere yet (the conversation page isn't built).
- Settings does nothing yet. Total hours always shows 0.
- MOIA class codes: only the made-up `TEST123` works. Put real codes in `CLASSES` at the top of `practice.js`.
- The Translate box uses the free MyMemory service (no key, about 5,000 words a day per user). Machine translation can be wrong.
