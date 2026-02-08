export const PRIVATE_PEM = process.env.PRIVATE_KEY;
export const PUBLIC_PEM = process.env.PUBLIC_KEY;

// Token expiration strings for JWT libraries
export const ACCESS_TOKEN_EXPIRATION = "15m";
export const REFRESH_TOKEN_EXPIRATION = "30d";

// Token expiration in milliseconds
export const ACCESS_TOKEN_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
