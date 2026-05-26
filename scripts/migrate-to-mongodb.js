// Load environment variables
require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    console.error('Please make sure .env.local exists with MONGODB_URI defined')
    process.exit(1)
}

// Data file paths
const dataDir = path.join(__dirname, '../data')
const productsFile = path.join(dataDir, 'products.json')
const projectsFile = path.join(dataDir, 'projects.json')
const categoriesFile = path.join(dataDir, 'categories.json')
const testimonialsFile = path.join(dataDir, 'testimonials.json')

// Define schemas inline
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    shortDescription: String,
    detailedDescription: String,
    material: String,
    color: String,
    dimensions: String,
    weight: String,
    price: Number,
    discount: Number,
    stock: String,
    customizationAvailable: Boolean,
    customizationInstructions: String,
    mainImage: String,
    additionalImages: [String],
    lifestyleImages: [String],
    packagingImages: [String],
    videoThumbnail: String,
    videoUrl: String,
    instagramReel: String,
    metaTitle: String,
    metaDescription: String,
    tags: [String],
    highlight: String,
    giftReady: Boolean,
    exportGrade: Boolean
}, { timestamps: true })

const projectSchema = new mongoose.Schema({
    name: String,
    client: String,
    category: String,
    description: String,
    longDescription: String,
    beforeImage: String,
    afterImage: String,
    installationVideo: String,
    clientTestimonial: String,
    testimonialVideo: String,
    completionDate: Date,
    location: String,
    materials: String,
    dimensions: String,
    featured: Boolean,
    tags: [String]
}, { timestamps: true })

const categorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    image: String,
    icon: String,
    parentCategory: String,
    order: Number,
    active: Boolean
}, { timestamps: true })

const testimonialSchema = new mongoose.Schema({
    name: String,
    role: String,
    company: String,
    content: String,
    rating: Number,
    image: String,
    featured: Boolean,
    projectReference: String
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
const Project = mongoose.model('Project', projectSchema)
const Category = mongoose.model('Category', categorySchema)
const Testimonial = mongoose.model('Testimonial', testimonialSchema)

async function migrateData() {
    try {
        console.log('🔄 Starting MongoDB migration...\n')

        // Connect to MongoDB
        console.log('📊 Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}\n`)

        // Read JSON files
        console.log('📁 Reading JSON files...')
        const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'))
        const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'))
        const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'))
        const testimonials = JSON.parse(fs.readFileSync(testimonialsFile, 'utf8'))

        console.log(`  - Products: ${products.length} found`)
        console.log(`  - Projects: ${projects.length} found`)
        console.log(`  - Categories: ${categories.length} found`)
        console.log(`  - Testimonials: ${testimonials.length} found\n`)

        // Migrate Products
        if (products.length > 0) {
            console.log('🔄 Migrating products...')

            const transformedProducts = products.map(p => {
                const product = { ...p }
                delete product.id
                delete product.createdAt
                delete product.updatedAt
                return product
            })

            await Product.deleteMany({})
            const insertedProducts = await Product.insertMany(transformedProducts)
            console.log(`✅ Migrated ${insertedProducts.length} products\n`)
        } else {
            console.log('ℹ️  No products to migrate\n')
        }

        // Migrate Projects  
        if (projects.length > 0) {
            console.log('🔄 Migrating projects...')

            const transformedProjects = projects.map(p => {
                const project = { ...p }
                delete project.id
                delete project.createdAt
                delete project.updatedAt
                return project
            })

            await Project.deleteMany({})
            const insertedProjects = await Project.insertMany(transformedProjects)
            console.log(`✅ Migrated ${insertedProjects.length} projects\n`)
        } else {
            console.log('ℹ️  No projects to migrate\n')
        }

        // Migrate Categories
        if (categories.length > 0) {
            console.log('🔄 Migrating categories...')

            const transformedCategories = categories.map(c => {
                const category = { ...c }
                delete category.id
                delete category.createdAt
                delete category.updatedAt
                if (!category.slug) {
                    category.slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }
                return category
            })

            await Category.deleteMany({})
            const insertedCategories = await Category.insertMany(transformedCategories)
            console.log(`✅ Migrated ${insertedCategories.length} categories\n`)
        } else {
            console.log('ℹ️  No categories to migrate\n')
        }

        // Migrate Testimonials
        if (testimonials.length > 0) {
            console.log('🔄 Migrating testimonials...')

            const transformedTestimonials = testimonials.map(t => {
                const testimonial = { ...t }
                delete testimonial.id
                delete testimonial.createdAt
                delete testimonial.updatedAt
                return testimonial
            })

            await Testimonial.deleteMany({})
            const insertedTestimonials = await Testimonial.insertMany(transformedTestimonials)
            console.log(`✅ Migrated ${insertedTestimonials.length} testimonials\n`)
        } else {
            console.log('ℹ️  No testimonials to migrate\n')
        }

        // Verification
        console.log('🔍 Verifying migration...')
        const productCount = await Product.countDocuments()
        const projectCount = await Project.countDocuments()
        const categoryCount = await Category.countDocuments()
        const testimonialCount = await Testimonial.countDocuments()

        console.log(`  - Products in MongoDB: ${productCount}`)
        console.log(`  - Projects in MongoDB: ${projectCount}`)
        console.log(`  - Categories in MongoDB: ${categoryCount}`)
        console.log(`  - Testimonials in MongoDB: ${testimonialCount}\n`)

        console.log('✅ Migration completed successfully!\n')

        // Create backup of JSON files
        console.log('💾 Creating backup of JSON files...')
        const backupDir = path.join(dataDir, 'backup-' + Date.now())
        fs.mkdirSync(backupDir, { recursive: true })

        fs.copyFileSync(productsFile, path.join(backupDir, 'products.json'))
        fs.copyFileSync(projectsFile, path.join(backupDir, 'projects.json'))
        fs.copyFileSync(categoriesFile, path.join(backupDir, 'categories.json'))
        fs.copyFileSync(testimonialsFile, path.join(backupDir, 'testimonials.json'))

        console.log(`✅ Backup created at: ${backupDir}\n`)

        console.log('🎉 All done! Your data has been migrated to MongoDB.')
        console.log('📝 JSON backups are available in case you need to rollback.\n')

        process.exit(0)

    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        console.error(error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log('👋 Disconnected from MongoDB')
    }
}

// Run migration
migrateData()
