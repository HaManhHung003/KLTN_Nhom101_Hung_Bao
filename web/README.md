# Real Estate Platform — Layout & Routing

Principal Frontend structure (Vite + React Router + TypeScript + Tailwind).  
Equivalent to Next.js App Router layout groups: `(client)`, `(broker)`, `(admin)`.

## Layout wrappers

| Layout | Path prefix | Shell |
|--------|-------------|--------|
| **ClientLayout** | `/client/*` | Header (Buy, Rent, Map, Post Property, Auth) + Footer + AI FAB |
| **BrokerLayout** | `/broker/*` | Collapsible sidebar + top bar (search, notifications popover, avatar) |
| **AdminLayout** | `/admin/*` | Dark sidebar + top bar (system alerts, quick actions) |

## Route map

### Client (`ClientLayout`)
```
/client                  Home
/client/buy              Buy listings
/client/rent             Rent listings
/client/map              Map search
/client/chatbot          AI assistant
/client/profile          User profile
/client/bookings         Viewing appointments
/client/property/:id     Property detail
```

### Broker (`BrokerLayout`)
```
/broker                        Dashboard
/broker/properties             My properties (+ market/map tabs)
/broker/properties/new         Create listing
/broker/properties/:id/edit    Edit listing
/broker/bookings               Bookings calendar
/broker/leads                  CRM lead board
/broker/inbox                  Messaging inbox
/broker/profile                Profile & packages
/broker/analytics              Performance reports
/broker/property/:id           Property detail
```

### Admin (`AdminLayout`)
```
/admin                   Overview
/admin/moderation        Moderation queue
/admin/users             User management
/admin/transactions      Transactions / deposits
/admin/logs              System logs
/admin/settings          Platform settings
/admin/property/:id      Property detail (supervise)
```

## File structure

```
src/
├── layouts/
│   ├── ClientLayout.tsx
│   ├── BrokerLayout.tsx
│   └── AdminLayout.tsx
├── components/layout/
│   ├── client/ClientChrome.tsx    # Header, Footer, FAB
│   ├── broker/BrokerSidebar.tsx
│   ├── broker/BrokerTopBar.tsx
│   ├── admin/AdminSidebar.tsx
│   └── admin/AdminTopBar.tsx
├── config/routes.ts               # Route constants + NavItem type
└── routes/AppRouter.tsx           # All nested routes
```

## Run

```bash
npm run dev
# → http://localhost:5173/client
# → http://localhost:5173/broker
# → http://localhost:5173/admin
```

Legacy `/buyer/*` and `/agent/*` redirect to `/client` and `/broker`.
