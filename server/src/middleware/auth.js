/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens.
 */

import jwt from 'jsonwebtoken';
import { supabase } from '../app.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from Supabase using the ID in the token
      const { data: user, error } = await supabase
        .from('users')
        .select('*, stores(name)')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // Attach user to the request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

/**
 * Role Middleware: Grant access only to specific roles
 * @param {...string} roles 
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};
