export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://marmex-prod-production.up.railway.app'

    // Fetch dynamic data
    let products = []
    let categories = []
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${baseUrl}/api/products?limit=1000`, { next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/api/categories`, { next: { revalidate: 3600 } })
        ])
        if (productsRes.ok) {
            const data = await productsRes.json()
            products = data.products || []
        }
        if (categoriesRes.ok) {
            categories = await categoriesRes.json()
        }
    } catch (e) {
        console.error('Sitemap fetch error:', e)
    }

    const staticRoutes = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/projects`, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/custom`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/terms-of-service`, changeFrequency: 'yearly', priority: 0.3 },
    ]

    const productUrls = products.map(p => ({
        url: `${baseUrl}/products/${p._id || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    const categoryUrls = categories.map(c => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(c.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
    }))

    return [...staticRoutes, ...productUrls, ...categoryUrls]
}
