# RX Board Store

> The official extension store for [RX Board](https://rx-network-security-labs.github.io/website/) — a privacy-first, plugin-based Android keyboard by RX Network Security Labs.

🌐 **Store:** [RX-Network-Security-Labs.github.io/rx-board-store](https://RX-Network-Security-Labs.github.io/rx-board-store)

---

## 📦 Repo Structure

```
rx-board-store/
├── index.html                        ← Home
├── plugins/index.html                ← Plugins page
├── language-packs/index.html         ← Language Packs page
├── voice-models/index.html           ← Voice Models page
├── item/index.html                   ← Individual item page (?id=...)
├── submit/index.html                 ← Submit portal
├── auth/index.html                   ← Sign in / Sign up
├── dashboard/index.html              ← Developer dashboard
├── admin/index.html                  ← Admin overview
├── admin/submissions/index.html      ← Admin: review submissions
├── admin/items/index.html            ← Admin: all items
├── admin/developers/index.html       ← Admin: all developers
├── about/index.html                  ← About page
├── assets/css/style.css              ← Shared styles
├── assets/js/supabase.js             ← Shared JS + Supabase
├── docs/edge-function.ts             ← Supabase Edge Function code
│
├── plugins/[item-id]/
│   ├── icon.png or icon.jpg          ← Item icon
│   ├── README.md                     ← Item detail page content
│   └── item.rxpp                     ← Plugin file
│
├── language-packs/[item-id]/
│   ├── icon.png or icon.jpg
│   ├── README.md
│   └── item.rxlp
│
├── voice-models/[item-id]/
│   ├── icon.png or icon.jpg
│   ├── README.md
│   └── item.lsttm
│
└── queue/                            ← Pending review (not shown on store)
    ├── plugins/[item-id]/
    ├── language-packs/[item-id]/
    └── voice-models/[item-id]/
```

---

## 🗂️ File Formats

| Extension | Type | Description |
|---|---|---|
| `.rxpp` | Plugin | Adds features, themes, or gestures to RX Board |
| `.rxlp` | Language Pack | Adds a keyboard layout for a new language |
| `.lsttm` | Voice Model | Offline voice typing model (Vosk-based) |

---

## 🔗 Links

| | |
|---|---|
| 🐙 GitHub | [github.com/RX-Network-Security-Labs](https://github.com/RX-Network-Security-Labs) |
| 💬 Discord | [discord.gg/gFtjWYQTzf](https://discord.gg/gFtjWYQTzf) |
| ✈️ Telegram | [t.me/rxnetworksecuritylabs](https://t.me/rxnetworksecuritylabs) |
| 🌐 Website | [rx-network-security-labs.github.io/website](https://rx-network-security-labs.github.io/website/) |
| 🤍 Donate | [Donate to RNSL](https://rx-network-security-labs.github.io/website/donate.html) |

---

© 2026 RX Network Security Labs
