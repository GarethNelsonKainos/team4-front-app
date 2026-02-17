/**
 * JWT Decoder Utility
 * Decodes JWT tokens to extract user information without verification
 * Note: This is safe for extracting role info since the token is already validated by the backend
 */

export interface DecodedToken {
	userEmail?: string;
	userRole?: string;
	userId?: number;
	iat?: number;
	exp?: number;
	[key: string]: unknown;
}

/**
 * Decode a JWT token to extract payload
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
	try {
		// JWT format: header.payload.signature
		const parts = token.split(".");

		if (parts.length !== 3) {
			throw new Error("Invalid token format");
		}

		// Decode the payload (second part)
		const payload = parts[1];
		const decoded = JSON.parse(
			Buffer.from(payload, "base64").toString("utf-8"),
		);

		return decoded as DecodedToken;
	} catch (error) {
		console.error("Error decoding token:", error);
		return null;
	}
}

/**
 * Extract user role from a JWT token
 * @param token - JWT token string
 * @returns User role ("admin" or "applicant") or null if not found
 */
export function getUserRole(token: string): "admin" | "applicant" | null {
	const decoded = decodeToken(token);
	console.log("🔍 Decoding JWT role:", { decoded, userRole: decoded?.userRole });

	if (!decoded || !decoded.userRole) {
		console.log("⚠️ No userRole found in JWT");
		return null;
	}

	if (typeof decoded.userRole === "string") {
		const normalizedRole = decoded.userRole.toLowerCase();
		if (normalizedRole === "admin" || normalizedRole === "applicant") {
			console.log(`✅ Role normalized: "${decoded.userRole}" -> "${normalizedRole}"`);
			return normalizedRole;
		}
	}

	console.log(`❌ Invalid role: "${decoded.userRole}"`);
	return null;
}

/**
 * Extract user email from a JWT token
 * @param token - JWT token string
 * @returns User email or null if not found
 */
export function getUserEmail(token: string): string | null {
	const decoded = decodeToken(token);
	if (!decoded || !decoded.userEmail) {
		return null;
	}
	return decoded.userEmail as string;
}

/**
 * Check if token is expired (basic check)
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
	const decoded = decodeToken(token);
	if (!decoded || !decoded.exp) {
		return false;
	}

	// exp is in seconds, Date.now() is in milliseconds
	return Date.now() / 1000 > decoded.exp;
}
