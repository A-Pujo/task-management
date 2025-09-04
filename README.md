# Task Manager App

A dashboard app for pdpsipa team tasks. Features:

- Dummy login (user: pdpsipa, pass: banteng1001#)
- Dashboard with cards for task stats (done, progress, critical)
- Paginated table for all tasks, colored by status
- Insert task page
- View task page
- Uses SQLite3 for now (future: Supabase/Postgres)
- Built with Next.js, Tailwind CSS, Lucide icons, shadcn/ui

## Setup

1. Run `npm install` to install dependencies
2. **Important: Regenerate the Prisma client to recognize the Objective model:**
   ```bash
   npx prisma generate
   ```
3. Run database migrations (if needed):
   ```bash
   npx prisma migrate dev
   ```
4. Start dev server: `npm run dev`

## Next Steps

- Migrate from MySQL to Supabase/Postgres
- Add authentication and user permissions
- Implement task notifications and reminders

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
