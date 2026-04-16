import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { ConvexProvider } from 'convex/react'
import Header from '../components/Header'
import { convex } from '../lib/convex'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'NeuralReach — Brain-Scored Outreach' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[#FAFAFA] text-gray-900 [overflow-wrap:anywhere]">
        <ConvexProvider client={convex}>
          <Header />
          {children}
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
