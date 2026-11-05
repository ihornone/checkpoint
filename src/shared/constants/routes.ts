export const Routes = {
  HOME: '/',
  MENU: '/menu/',
  MENU_ITEM: (slug: string) => `/menu/${slug}/`,
  OFFERS: '/#offers',
  DELIVERY: '/delivery/',
  ABOUT: '/about/',
  CONTACTS: '/contacts/',
  REVIEWS: '/reviews/',
  PRIVACY: '/privacy/',
  PAYMENT: '/payment/',
  PAYMENT_SUCCESS: '/payment/success/',
  PAYMENT_FAIL: '/payment/fail/',
} as const;

export const MAIN_NAV_ITEMS = [
  { href: Routes.HOME, label: 'Головна' },
  { href: Routes.MENU, label: 'Меню' },
  { href: Routes.OFFERS, label: 'Акції' },
  { href: Routes.DELIVERY, label: 'Доставка' },
  { href: Routes.ABOUT, label: 'Про нас' },
  { href: Routes.CONTACTS, label: 'Контакти' },
] as const;
