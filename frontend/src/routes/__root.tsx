import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { ConvexProvider } from 'convex/react'
import Header from '../components/Header'
import Footer from '../components/Footer'
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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-neutral-950 text-neutral-100 [overflow-wrap:anywhere]">
        <ConvexProvider client={convex}>
          <Header />
          {children}
          <Footer />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}
