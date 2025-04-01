import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

// Cache the JWKS for performance
let jwksCache = null;
let cacheTime = null;

// Configuration
const region = 'eu-north-1';
const userPoolId = 'eu-north-1_2Wez3B7dw';
const clientId = '76voiupv9jps5cio5vra94fj1k';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('-------- Auth Middleware Start --------');
    console.log('Request path:', req.path);
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid authorization header format');
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Token extracted (first 20 chars):', token.substring(0, 20) + '...');
    
    // Decode the token (without verification) to get the kid
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      console.log('Failed to decode token');
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    console.log('Token decoded successfully');
    console.log('Token kid:', decodedToken.header.kid);
    console.log('Token iss:', decodedToken.payload.iss);
    console.log('Token client_id:', decodedToken.payload.client_id);
    
    // Refresh the JWKS cache if needed
    if (!jwksCache || !cacheTime || (Date.now() - cacheTime > 3600000)) {
      console.log('Fetching JWKS from Cognito...');
      // Get the JWKS from Cognito
      const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
      console.log('JWKS URL:', jwksUrl);
      
      const jwksResponse = await axios.get(jwksUrl);
      jwksCache = jwksResponse.data.keys;
      cacheTime = Date.now();
      console.log('JWKS fetched successfully, keys count:', jwksCache.length);
      console.log('Available kids in JWKS:', jwksCache.map(k => k.kid));
    } else {
      console.log('Using cached JWKS, keys count:', jwksCache.length);
    }
    
    // Find the JWK that matches the kid from the token
    const kid = decodedToken.header.kid;
    const jwk = jwksCache.find(key => key.kid === kid);
    
    if (!jwk) {
      console.error(`JWK for kid ${kid} not found in available keys`);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log('Matching JWK found for kid:', kid);
    
    // Convert JWK to PEM format
    const pem = jwkToPem(jwk);
    console.log('JWK converted to PEM format');
    
    // Verify the token
    jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      console.log('Token verified successfully');
      console.log('User sub:', (decoded as any).sub);
      console.log('Token scope:', (decoded as any).scope);
      
      // Add the user info to the request object
      (req as any).user = decoded;
      
      console.log('-------- Auth Middleware End: SUCCESS --------');
      // Continue to the next middleware
      next();
    });
  } catch (error) {
    console.error('-------- Auth Middleware End: ERROR --------');
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};