import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Clock | AI-Powered 0-Clash Timetable SaaS',
  description:
    'Automated, clash-free academic timetable generator with live drag-and-drop editor, department chat, and instant PDF/Excel exports.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FDF6EC] text-black">
        {children}
      </body>
    </html>
  );
}
