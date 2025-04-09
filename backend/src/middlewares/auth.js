const jwtConfig = require('../utils/jwtConfig');
const customerModel = require('../models/customersModel');

const authenticateToken = async (req, res, next) => {
  
  const token = req.header('Authorization')?.split(' ')[1];
  console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'No token'); // Debug log
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Token is missing' });
  }

  try {
    const decoded = jwtConfig.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    req.user = decoded; 

    if (decoded.role === 'Customer') {
      try {
        const customer = await customerModel.getByAccountId(decoded.id);
        
        console.log('Customer info from database:', customer); // Debug log
        
        if (customer) {
          // Lưu cả hai kiểu viết của customerId
          req.user.customerId = customer.CustomerID;
          req.user.CustomerID = customer.CustomerID;
        } else {
          console.warn(`No customer record found for account ID: ${decoded.id}`);
        }
      } catch (dbError) {
        console.error('Error fetching customer data:', dbError);
      }
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};




module.exports = {
  authenticateToken,
};
