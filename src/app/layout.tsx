import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreamWord — Угадай слово для стрима',
  description: 'Игра для стримеров и зрителей Twitch',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body className="bg-bg-primary text-text-primary font-ui">{children}</body>
    </html>
  )
}