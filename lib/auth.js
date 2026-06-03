import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

class UserNotFoundError extends CredentialsSignin {
    code = "User not found."
}

class InvalidPasswordError extends CredentialsSignin {
    code = "Invalid password."
}

export const {
    handlers,
    signIn,
    signOut,
    auth
} = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null
                    }

                    await connectDB()

                    const user = await User.findOne({
                        email: credentials.email.toLowerCase()
                    }).lean()

                    const isValid = user && user.password && await bcrypt.compare(credentials.password, user.password)
                    if (!isValid) {
                        throw new CredentialsSignin('Invalid email or password')
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.photo || null,
                        role: user.role
                    }
                } catch (error) {
                    console.error('CRITICAL AUTH ERROR CAUGHT:', error)
                    throw error
                }
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        }
    },

    pages: {
        signIn: '/auth/login',
    },

    secret: process.env.NEXTAUTH_SECRET,
    // Railway is a managed PaaS with SSL-terminating reverse proxy.
    // trustHost must be true for Auth.js to accept forwarded host headers.
    trustHost: true,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
})
