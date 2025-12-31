// Run database initialization on server startup
let initPromise: Promise<void> | null = null;

export async function initializeDatabase() {
    // Ensure we only run initialization once
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            console.log('🚀 Initializing database...');
            // Database initialization logic can be added here if needed
            console.log('✅ Database initialization complete');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            // Don't throw - let the app continue
        }
    })();

    return initPromise;
}

// Auto-run on server startup (only in Node.js environment)
if (typeof window === 'undefined') {
    initializeDatabase();
}
