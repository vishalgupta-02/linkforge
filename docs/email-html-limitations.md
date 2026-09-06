# Email HTML & Rendering Limitations

This document outlines key technical constraints and best practices when designing, coding, and maintaining transactional email templates in LinkFlow using React Email.

---

## Core Limitations of HTML Email

### 1. Email Clients Are Not Modern Web Browsers
- Email clients (e.g., Gmail web/mobile, Apple Mail, Microsoft Outlook on Windows/macOS/Web, Yahoo Mail) use distinct rendering engines (such as WebKit, Word/Trident, or proprietary HTML parsers).
- Features available in modern evergreen browsers frequently fail or render unpredictably in email clients.

### 2. No JavaScript or Dynamic Client-Side Interactivity
- Email clients strip `<script>` tags, event handlers (`onClick`, `onHover`), and form actions for security reasons.
- All email components must be completely static and purely presentational.

### 3. Inconsistent CSS Support Across Clients
- **CSS Grid & Flexbox**: Unsupported or inconsistently supported in desktop clients like Microsoft Outlook for Windows. Table-based layouts or containerized sections are required.
- **CSS Variables / Custom Properties**: Stripped or ignored by several major webmail and desktop clients.
- **Advanced Selectors & Pseudo-Classes**: Pseudo-elements (`::before`, `::after`) and hover states (`:hover`) are generally unsupported or stripped.
- **Inline Styling**: Inline-compatible styles (`style={...}`) provide the highest compatibility across all email clients.

### 4. Typography & External Assets
- **Web Fonts**: Custom `@font-face` or Google Fonts will often be ignored in favor of client system fallbacks (e.g., Arial, Helvetica, Segoe UI, sans-serif). Always specify robust fallback font stacks.
- **Images**: Many clients disable images by default until the recipient approves them. Always provide semantic `alt` text and ensure key messages and CTAs are rendered using HTML text and styled button elements rather than embedded in image graphics.
- **Background Images**: Support for CSS background images is uneven across desktop Outlook and certain mobile clients. Use solid background colors for critical sections.

### 5. Layout & Sizing Constraints
- Maintain a constrained container width (typically 500px – 600px) centered via margins.
- Ensure all content remains readable and responsive on small mobile screens without horizontal scrolling.

---

## Testing & Verification Guidelines

- **Browser Preview is a Starting Point, Not Verification**: The local React Email preview server (`pnpm email:dev`) renders templates inside a modern Chromium browser. It validates structure, props, and design direction, but does **not** simulate email-client rendering engines.
- **Pre-Production Client Testing**: Before deploying critical transactional templates to production, test them across major clients (Gmail, Apple Mail, Outlook) or through email rendering testing suites (e.g., Litmus, Email on Acid).
