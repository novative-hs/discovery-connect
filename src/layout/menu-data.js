const menu_data = [
  {
    id: 1,
    title: 'Home',
    link: '/',
  },
  {
    id: 2,
    title: 'About Us',
    link: '/about'
  },
  {
    id: 3,
    title: 'Discover',
    link: '/shop'
  },
   {
    id: 4,
    title: 'Board of Advisor',
    link: '/boardadvisor'
  },
  {
    id: 5,
    hasDropdown: true,
    title: 'Learn More',
    link: '/about',
    submenus: [
      { title: 'Privacy & Policy', link: '/policy' },
      { title: 'Terms & Conditions', link: '/terms' },
      { title: 'Login', link: '/login' },
      { title: 'Register', link: '/register' },
      { title: 'Forgot Password', link: '/forgot' },
    ]
  },
  
]

export default menu_data;
