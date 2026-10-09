# Queue Folder

This folder holds submitted files waiting for admin review.

**Do not manually edit files here.**

## Structure
```
queue/
├── plugins/[item-id]/
│   ├── icon.png or icon.jpg
│   ├── README.md
│   └── item.rxpp
├── language-packs/[item-id]/
└── voice-models/[item-id]/
```

## Flow
1. Developer submits → files land here
2. Admin reviews in Admin Panel
3. Approved → files moved to correct folder (`plugins/`, etc)
4. Rejected → files deleted

**Contents are never shown on the public store.**
