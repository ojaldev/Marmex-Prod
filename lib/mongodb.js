import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
    console.error('❌ MongoDB Error: MONGODB_URI is not defined in environment variables')
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
    if (!MONGODB_URI) {
        console.error('❌ MongoDB Error: MONGODB_URI is not defined in environment variables')
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    if (cached.conn) {
        console.log('✅ MongoDB: Using cached connection')
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        }

        console.log('🔄 MongoDB: Connecting to database...')
        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB: Successfully connected to database')
                console.log(`📊 MongoDB: Database name - ${mongoose.connection.db.databaseName}`)
                return mongoose
            })
            .catch((error) => {
                console.error('❌ MongoDB Connection Error:', error.message)
                throw error
            })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default connectDB
