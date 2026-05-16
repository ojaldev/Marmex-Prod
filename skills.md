# MarmexIndia E-Commerce Development Guidelines

This document outlines the core skills, best practices, and technological approaches for building the MarmexIndia platform. It serves as a guide for AI agents and developers working on the project.

## 1. Tech Stack Foundation
- **Core:** Next.js 16 (App Router), React 19
- **Database:** MongoDB via Mongoose (v9)
- **Auth & Security:** NextAuth.js (v5), Bcrypt
- **E-Commerce:** Razorpay (Payments), Nodemailer (Emails), PDFKit (Invoices)
- **Media:** Cloudinary
- **Validation:** Zod

## 2. UI/UX Excellence for E-Commerce
To achieve a premium, high-converting aesthetic:
- **Visual Hierarchy:** Use clear, modern typography and ample whitespace to make products the hero. Ensure a mobile-first, touch-friendly design.
- **Micro-Interactions:** Utilize subtle animations (e.g., hover states on `CategoryTiles`, smooth cart transitions) to make the interface feel alive and responsive.
- **Feedback Loops:** Provide immediate visual feedback for user actions (e.g., adding to cart, loading states) using `lucide-react` icons and skeleton loaders.
- **Checkout Friction:** Keep forms minimal, validate inputs instantly using **Zod**, and ensure the Razorpay integration is seamless and trustworthy.

## 3. 3D Web Integration (Performance-First)
Integrating 3D elements can significantly boost engagement, but performance is critical for SEO and conversions.
- **Recommended Tools:** Integrate `three` and `@react-three/fiber` for declarative 3D scenes, along with `@react-three/drei` for pre-built helpers (like orbit controls).
- **Model Optimization:** Only use compressed `.glb` or `.gltf` files (preferably Draco-compressed) for 3D product models to minimize bundle sizes.
- **Lazy Loading & Fallbacks:** Wrap 3D canvas elements in React's `<Suspense>`. **Crucially**, always display a high-quality 2D image placeholder (served via Cloudinary) while the 3D model loads.
- **Scroll-Triggered 3D:** For landing pages, consider tying 3D model animations to the scroll position for a highly immersive storytelling experience without overwhelming the user.

## 4. Search Engine Optimization (SEO)
SEO must be built into every page from the ground up using Next.js capabilities:
- **Dynamic Metadata:** Leverage Next.js `generateMetadata` in `page.js` files to dynamically create unique `<title>`, `description`, and Open Graph tags for every product and category page.
- **Structured Data (JSON-LD):** Inject Schema.org markup (specifically `Product`, `Offer`, `AggregateRating`, and `BreadcrumbList`) into product pages to enable Google Rich Snippets.
- **Next.js Image Optimization:** Strictly use the Next.js `<Image>` component for all product photos. Configure it with a custom Cloudinary loader to ensure images are served in modern formats (WebP/AVIF) and are properly sized/lazy-loaded.
- **Semantic HTML:** Use proper HTML5 tags (`<article>`, `<section>`, `<nav>`, `<h1>` to `<h6>`) for accessibility and crawler understanding. Ensure every page has a single, descriptive `<h1>`.
- **Dynamic Sitemaps:** Utilize Next.js `sitemap.js` and `robots.js` files to automatically generate and update sitemaps as new products are added to the MongoDB database.
