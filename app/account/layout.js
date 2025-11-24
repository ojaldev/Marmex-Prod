import { redirect } from 'next/navigation'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import styles from './account.module.css'

export default async function AccountLayout({ children }) {
    const session = await auth()

    if (!session) {
        redirect('/auth/login?callbackUrl=/account')
    }

    return (
        <div className={styles.accountLayout}>
            {children}
        </div>
    )
}
