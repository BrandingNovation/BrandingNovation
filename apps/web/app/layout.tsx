import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import React from 'react';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FlowForge - AI Workflow Automation Platform',
    template: '%s | FlowForge',
  },
  description:
    'Democratize AI automation by making enterprise-grade workflows accessible to every business user. Build sophisticated automation pipelines without coding.',
  keywords: [
    'AI automation',
    'workflow automation',
    'no-code',
    'business process automation',
    'integration platform',
    'AI agents',
  ],
  authors: [
    {
      name: 'FlowForge Team',
      url: 'https://flowforge.ai',
    },
  ],
  creator: 'FlowForge',
  publisher: 'FlowForge',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flowforge.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flowforge.ai',
    title: 'FlowForge - AI Workflow Automation Platform',
    description:
      'Build sophisticated AI-powered automation workflows without coding. Connect your business tools and let AI handle the complex logic.',
    siteName: 'FlowForge',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowForge - AI Workflow Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowForge - AI Workflow Automation Platform',
    description:
      'Build sophisticated AI-powered automation workflows without coding.',
    images: ['/og-image.png'],
    creator: '@flowforge',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}