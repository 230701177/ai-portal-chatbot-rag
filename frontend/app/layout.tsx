import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LoadingBar } from '@/components/LoadingBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Portal Assistant - Enterprise RAG Platform',
  description: 'Document-grounded AI assistant powered by AWS Bedrock and OpenSearch',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingBar />
        {children}
      </body>
    </html>
  )
}
