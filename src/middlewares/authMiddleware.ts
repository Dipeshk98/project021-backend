import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

// Cache the JWKS for performance
let jwksCache = null;
let cacheTime = null;

// Configuration
const region = "us-west-1";
const userPoolId = "us-west-1_PoRjnQjbm";
const clientId = "12b0pqhf68mftc04f1d8eu3mee";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Auth Middleware Start
    // Request path and environment
    // Authorization header present

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Invalid authorization header format
      res.status(401).json({ error: "Missing or invalid authorization token" });
      return;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    // Token extracted

    // ✨ LOCAL DEVELOPMENT BYPASS ✨
    // If in development and token matches the local Cognito user ID, bypass JWT verification
    if (
      process.env.NODE_ENV === "development" &&
      token === process.env.COGNITO_USER_ID_LOCAL
    ) {
      // LOCAL DEVELOPMENT MODE: Bypassing JWT verification
      // Using local user ID

      // Mock user object for local development
      (req as any).user = {
        sub: token,
        client_id: clientId,
        username: "local-dev-user",
        "cognito:username": "local-dev-user",
      };

      // Auth Middleware End: LOCAL DEV SUCCESS
      next();
      return;
    }

    // Decode the token (without verification) to get the kid
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      // Failed to decode token
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    // Token decoded successfully
    // Token details

    // Refresh the JWKS cache if needed
    if (!jwksCache || !cacheTime || Date.now() - cacheTime > 3600000) {
      // Fetching JWKS from Cognito
      // Get the JWKS from Cognito
      const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
      // JWKS URL

      const jwksResponse = await axios.get(jwksUrl);
      jwksCache = jwksResponse.data.keys;
      cacheTime = Date.now();
      // JWKS fetched successfully
    } else {
      // Using cached JWKS
    }

    // Find the JWK that matches the kid from the token
    const { kid } = decodedToken.header;
    const jwk = jwksCache.find((key) => key.kid === kid);

    if (!jwk) {
      // JWK for kid not found
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Matching JWK found

    // Convert JWK to PEM format
    const pem = jwkToPem(jwk);
    // JWK converted to PEM format

    // Verify the token
    jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        // Token verification failed
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      // Token verified successfully
      // User details

      // Add the user info to the request object
      (req as any).user = decoded;

      // Auth Middleware End: SUCCESS
      // Continue to the next middleware
      next();
    });
  } catch (error) {
    // Auth Middleware End: ERROR
    // Authentication error
    res.status(401).json({ error: "Authentication failed" });
  }
};
