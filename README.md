# Task Manager App

A dashboard app for pdpsipa team tasks. Features:

- Dummy login (user: pdpsipa, pass: banteng1001#)
- Dashboard with cards for task stats (done, progress, critical)
- Paginated table for all tasks, colored by status
- Insert task page
- View task page with objectives and task logs
- Uses Supabase PostgreSQL database
- Built with Next.js, Tailwind CSS, Lucide icons, shadcn/ui

## Setup

1. Run `npm install` to install dependencies
2. Set up environment variables:
   - Create a `.env` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Initialize the database:
   - Run `npm run db:setup` to create the necessary tables in your Supabase database
   - Alternatively, run `npm run migrate` which uses a bash script to load environment variables and run the setup

## Database Setup Troubleshooting

If you encounter database connection issues:

1. Verify your Supabase credentials in the `.env` file
2. Make sure your Supabase project has the Row Level Security (RLS) policies properly configured
3. Check the browser console for specific error messages
4. If tables are not created automatically:
   - Run `npm run db:setup` manually
   - Check if you have permissions to create tables in your Supabase instance
   ```

   ```
5. Set up the database tables:

   ```bash
   npm run db:setup
   ```

   Alternative (if admin access):

   ```bash
   npm run migrate
   ```

6. Start dev server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses three main tables:

- **Task**: Stores task information (name, dates, status, description)
- **Objective**: Stores objectives related to tasks (description, status)
- **Log**: Stores activity logs for tasks (date, message)

## Next Steps

- Add authentication and user permissions
- Implement task notifications and reminders
- Add task filtering and search functionality

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
