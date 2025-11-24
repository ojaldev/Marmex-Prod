export default function SettingsPage() {
    return (
        <div>
            <h1>Settings</h1>
            <p style={{ color: 'var(--color-text-gray)', marginTop: 'var(--spacing-sm)' }}>System settings and configuration</p>

            <div className="card" style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Site Information</h3>
                <div style={{ color: 'var(--color-text-gray)' }}>
                    <p><strong>Application:</strong> Marmex India CMS</p>
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Framework:</strong> Next.js 15</p>
                    <p style={{ marginTop: 'var(--spacing-md)' }}>
                        Settings and advanced configuration options will be available here in future updates.
                    </p>
                </div>
            </div>
        </div>
    )
}
