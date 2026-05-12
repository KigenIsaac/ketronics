# Ketronics LTD - E-Commerce Platform

![Ketronics LTD](https://img.shields.io/badge/Ketronics-LTD-blue?style=for-the-badge&logo=shopify)
![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.93.1-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan?style=flat-square&logo=tailwind-css)

A modern, full-featured e-commerce platform built with Next.js 16, designed for technology products and services in Kenya and East Africa.

## 🌟 Features

### 🛒 E-Commerce Core
- **Product Catalog**: Browse laptops, printers, TVs, monitors, and electronics
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order lifecycle from placement to delivery
- **User Authentication**: Secure login/signup with role-based access
- **Payment Integration**: Ready for payment gateway integration

### 👥 User Management
- **Customer Dashboard**: Order history, profile management, settings
- **Admin Panel**: Product management, order processing, user administration
- **Role-Based Access**: Different experiences for customers and managers
- **User Profiles**: Account management and preferences

### 🛠️ Services & Support
- **CCTV Installation**: Professional security system setup
- **Network Solutions**: IT infrastructure and connectivity services
- **Technical Support**: 24/7 emergency support and maintenance
- **Service Scheduling**: Book appointments for installations and repairs

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Themes**: Theme switching capability
- **Toast Notifications**: Real-time feedback for all user actions
- **Loading States**: Smooth loading experiences throughout
- **Accessibility**: WCAG compliant components and navigation

### 📱 Modern UI/UX
- **Shadcn/UI Components**: Beautiful, accessible component library
- **Infinite Scrolling Banner**: Important contact information display
- **Mobile Navigation**: Hamburger menu with smooth animations
- **Product Cards**: Optimized layouts for different screen sizes
- **Interactive Elements**: Hover effects and micro-interactions

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.5 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **UI Library**: Shadcn/UI (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: Zustand 5
- **Forms**: React Hook Form + Zod validation

### Backend & Database
- **Backend-as-a-Service**: Supabase
- **Authentication**: Supabase Auth with RLS policies
- **Database**: PostgreSQL with real-time subscriptions
- **File Storage**: Supabase Storage
- **API**: RESTful APIs with TypeScript types

### Development Tools
- **Build Tool**: Turbopack (Next.js built-in)
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
ketronics/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected user pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── forms/             # Form components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and configurations
│   │   ├── stores/            # Zustand stores
│   │   ├── utils/             # Helper functions
│   │   └── validations/       # Zod schemas│   ├── templates/             # Email templates
│   │   ├── email-confirmation.html    # HTML email template
│   │   ├── email-confirmation.txt     # Plain text fallback
│   │   └── README.md          # Template documentation│   └── hooks/                 # Custom React hooks
├── database_updates.sql       # Database schema
├── components.json           # Shadcn/UI configuration
├── tailwind.config.js        # Tailwind configuration
└── package.json              # Dependencies and scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ketronics.git
cd ketronics
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For production deployment
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL commands from `database_updates.sql` in your Supabase SQL editor
3. Configure Row Level Security (RLS) policies as needed

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

The application uses a comprehensive database schema including:

- **Users**: Authentication and profile management
- **Products**: Catalog with categories, pricing, and inventory
- **Orders**: Complete order lifecycle management
- **Categories**: Product organization
- **Pages**: Dynamic content management for CMS
- **FAQs**: Frequently asked questions system
- **Contact Info**: Business contact information

## 🎯 Key Features Implementation

### Authentication Flow
- Secure login/signup with email verification
- Password reset functionality
- Role-based redirects (customers → dashboard, managers → admin)
- Persistent sessions with automatic token refresh

### Shopping Experience
- Product filtering and search
- Real-time cart updates with local storage persistence
- Secure checkout process (payment integration ready)
- Order tracking and history

### Admin Panel
- Product CRUD operations
- Order management and status updates
- User administration
- Analytics and reporting (charts with Recharts)

### Content Management
- Dynamic pages for About Us, Support, Terms, etc.
- FAQ management system
- Contact information management
- SEO-friendly meta tags

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper error handling and loading states
- Test on multiple screen sizes
- Use semantic commit messages

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run database_updates.sql in Supabase dashboard
```

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS 4 with custom CSS variables for theming. Configuration is in `src/app/globals.css`.

### Shadcn/UI
Components are configured in `components.json`. Add new components using:
```bash
npx shadcn@latest add [component-name]
```

### Supabase
- Authentication configured in `src/lib/supabase/`
- Database types generated automatically
- RLS policies ensure data security

## 🐛 Troubleshooting

### Common Issues
1. **Build Errors**: Ensure all environment variables are set
2. **Database Connection**: Verify Supabase credentials and network access
3. **Type Errors**: Run `npm run build` to check for TypeScript issues
4. **Styling Issues**: Clear browser cache and check Tailwind configuration

### Performance Optimization
- Images are optimized automatically by Next.js
- Components use React.memo where appropriate
- Database queries are optimized with proper indexing

## 📄 License

This project is proprietary software owned by Ketronics LTD.

## 📞 Support

For support and questions:
- **Email**: support@ketronics.co.ke
- **Phone**: +254 700 000 000
- **Website**: [ketronics.co.ke](https://ketronics.co.ke)
- **Address**: AA building 1st floor room F6A

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase Team** for the excellent backend platform
- **Shadcn** for the beautiful component library
- **Vercel** for hosting and deployment platform

---

**Built with ❤️ in Nairobi, Kenya**