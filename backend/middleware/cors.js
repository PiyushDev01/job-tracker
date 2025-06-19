// CORS middleware specifically for Vercel deployment
const verifyCors = (req, res, next) => {
  // Log the request for debugging
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'unknown'}`);
  
  // Use proper CORS handling for different origins
  const origin = req.headers.origin;
  if (origin) {
    // Use the actual origin for CORS to support credentials
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // If no origin, use wildcard (doesn't support credentials)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific headers
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    
  // Set max age for preflight results cache
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(204).end();
  }
  
  next();
};

export default verifyCors;
