import { CartDrawer } from '@/components/shop/cart-drawer'
import { Footer, Header, Hero, HowItWorks, WhyItMatters } from '@/components/landing'
import { Studio } from '@/components/studio/studio'
import { CartProvider } from '@/lib/cart'

export default function Page() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <WhyItMatters />
        <HowItWorks />
        <Studio />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
