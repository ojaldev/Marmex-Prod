import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

/**
 * Sign an admin JWT token.
 * Payload: { admin: true, iat: <timestamp> }
 * Expires in 7 days.
 */
export async function signAdminToken() {
    return new SignJWT({ admin: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
}

/**
 * Verify an admin JWT token.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function verifyAdminToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret, {
            clockTolerance: 60,
            requiredClaims: ['admin'],
        })
        return payload.admin === true
    } catch {
        return false
    }
}
