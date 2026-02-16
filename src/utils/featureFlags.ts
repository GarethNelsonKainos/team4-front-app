/**
 * Feature flags management utility
 * Handles fetching, caching, and checking feature flags
 */

interface FeatureFlags {
	[key: string]: boolean;
}

let cachedFlags: FeatureFlags | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch feature flags from the backend API
 * Uses cached version if available and not expired
 * @returns Promise with feature flags object
 */
export async function loadFeatureFlags(): Promise<FeatureFlags> {
	const now = Date.now();

	// Return cached flags if still valid
	if (cachedFlags && now - lastFetchTime < CACHE_DURATION) {
		return cachedFlags;
	}

	try {
		// Dynamically import apiClient to avoid circular dependencies
		const { getFeatureFlags } = await import("./apiClient");
		const result = await getFeatureFlags();

		if (result.success) {
			cachedFlags = result.data;
			lastFetchTime = now;
			return cachedFlags as FeatureFlags;
		}

		console.warn("Failed to fetch feature flags:", result.error);
		// Return empty object or defaults if fetch fails
		return getDefaultFlags();
	} catch (error) {
		console.error("Error loading feature flags:", error);
		return getDefaultFlags();
	}
}

/**
 * Check if a specific feature flag is enabled
 * @param flagName - Name of the feature flag
 * @returns true if flag is enabled, false otherwise
 */
export function isFeatureEnabled(flagName: string): boolean {
	if (!cachedFlags) {
		return false;
	}
	return cachedFlags[flagName] === true;
}

/**
 * Get default/fallback feature flags
 * These can be set via environment variables for development
 * @returns Default feature flags object
 */
function getDefaultFlags(): FeatureFlags {
	return {
		JOB_DETAIL_VIEW: process.env.FEATURE_JOB_DETAIL_VIEW === "true" || false,
		JOB_APPLY: process.env.FEATURE_JOB_APPLY === "true" || false,
	};
}

/**
 * Invalidate the feature flags cache
 * Useful for testing or manual cache clearing
 */
export function invalidateCache(): void {
	cachedFlags = null;
	lastFetchTime = 0;
}
