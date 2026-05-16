import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

class UserNotFoundError extends CredentialsSignin {
    code = "User not found."
}

class InvalidPasswordError extends CredentialsSignin {
    code = "Invalid password."
}
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
                        console.log('Auth: User not found for email', credentials.email)
                        throw new UserNotFoundError()
                    }

                    const isValid = await user.comparePassword(credentials.password)
                    if (!isValid) {
                        console.log('Auth: Invalid password for email', credentials.email)
                        throw new InvalidPasswordError()
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
    trustHost: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
