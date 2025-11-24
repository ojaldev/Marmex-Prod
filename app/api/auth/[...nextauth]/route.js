import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
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
                    })

                    if (!user) {
                        return null
                    }

                    const isValid = await user.comparePassword(credentials.password)

                    if (!isValid) {
                        return null
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.photo || null,
                        role: user.role
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
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
})

export const GET = handlers.GET
export const POST = handlers.POST
