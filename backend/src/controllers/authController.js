const bcrypt = require('bcrypt');
const Account = require('../models/accountModel');
const Customer = require('../models/customersModel');
const jwtConfig = require('../utils/jwtConfig');
const RefreshToken = require('../models/refreshTokenModel');

const saltRounds = 10;

exports.register = async (req, res) => {
    const {username, password} = req.body;
    try {
    //kiem tra xem account da ton tai hay chua
    const existingAccount = await Account.getByUsername(username);
    if (existingAccount) {
        return res.status(400).json({message: "Account already exists!"});
    }
    //ma hoa password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //tao account moi
    const newAccount = await Account.create({username, password: hashedPassword});

    //gui thong bao ve client
    res.status(201).json({message: "Register successfully!", account: {id: newAccount[0].insertId, username, role: "Customer"}});

    } catch (error) { 
        res.status(500).json({message: "Error when registering!", error: error.message});
    }
}


exports.login = async (req, res) => {
    const {username, password} = req.body;  
    try {
        //tim account
        const account = await Account.getByUsername(username);

        //kiem tra xem account co ton tai hay khong
        if (!account) {
            return res.status(401).json({message: "Invalid username or password!"});
        }

        //kiem tra password
        const isMatch = await bcrypt.compare(password, account.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid username or password!"});
        }

        //tao access token 
        const token = jwtConfig.generateAccessToken({
            id: account.AccountID, username: account.Username, role: account.Role});
        console.log('Generated access token:', token);
        console.log('Created at:', new Date());

        //tao refresh token
        const refreshToken = jwtConfig.generateRefreshToken({
            id: account.AccountID, username: account.Username, role: account.Role});

        //luu refresh token vao database
        await RefreshToken.createRefreshToken(refreshToken);

        //gui thong bao ve cho client
        await Account.lastLogin(username);

        // Trả về thông tin token và customerID
        const responseData = {
            token,
            refreshToken,
            role: account.Role,
            username: account.Username
        };

        // Nếu là Customer, lấy thêm thông tin customer
        if (account.Role === 'Customer') {
            try {
                const customer = await Customer.getByAccountId(account.AccountID);
                if (customer) {
                    responseData.customerId = customer.CustomerID;
                    responseData.CustomerID = customer.CustomerID;
                }
            } catch (error) {
                console.error('Error fetching customer data during login:', error);
            }
        }

        return res.status(200).json(responseData);

    } catch (error) {
        res.status(500).json({message: "Error when logging in!", error: error.message});
    }
}


exports.getProfile = async (req, res) => {
    try {
        const decoded = req.user;
        
        if (!decoded) {
            return res.status(400).json({
                message: "No user data found"
            });
        }

        // Kiểm tra từng trường
        if (!decoded.id || !decoded.username || !decoded.role) {
            console.log('Missing required fields in decoded token:', decoded);
            return res.status(400).json({
                message: "Incomplete user data",
                decoded: decoded // Debug info
            });
        }

        // Tạo đối tượng profile cơ bản
        const profileData = {
            accountId: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        // Nếu người dùng là Customer, lấy thêm CustomerID
        if (decoded.role === 'Customer') {
            try {
                console.log("Getting customer info for accountId:", decoded.id);
                const customerInfo = await Customer.getByAccountId(decoded.id);
                
                if (customerInfo) {
                    console.log("Found customer info:", customerInfo);
                    // Thêm CustomerID vào thông tin profile
                    profileData.CustomerID = customerInfo.CustomerID;
                    profileData.fullName = customerInfo.FullName;
                    profileData.email = customerInfo.Email;
                    profileData.phoneNumber = customerInfo.PhoneNumber;
                } else {
                    console.log("No customer info found for accountId:", decoded.id);
                }
            } catch (error) {
                console.error("Error getting customer info:", error);
                // Vẫn tiếp tục trả về thông tin cơ bản nếu có lỗi
            }
        }

        // Nếu là Customer, lấy thêm thông tin customer
        if (req.user.role === 'Customer') {
            try {
                const customer = await Customer.getByAccountId(req.user.id);
                if (customer) {
                    profileData.customerId = customer.CustomerID;
                    profileData.CustomerID = customer.CustomerID;
                    profileData.customer = customer;
                }
            } catch (error) {
                console.error('Error fetching customer data during getProfile:', error);
            }
        }

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Error in getProfile:", error);
        res.status(500).json({message: "Error when getting profile!", error: error.message});
    }
}


exports.logout = async (req, res) => {
    try {
        const decoded = req.user;
        const result = await RefreshToken.removeRefreshToken(decoded.id);
        if (result) {
            res.status(200).json({message: "Logout successfully!"});
        } else {
            res.status(400).json({message: "Logout failed!"});
        }
    } catch (error) {
        res.status(500).json({message: "Error when logging out!", error: error.message});
    }
}


exports.refreshToken = async (req, res) => {
    
    try {
        const {refreshToken} = req.body;
        //lay refresh token tu body
        
        if (!refreshToken) {
            return res.status(401).json({message: "Refresh token is required!"});
        }

        //xac thuc refresh token co hop le hay khong
        const decoded = jwtConfig.verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({message: "Invalid refresh token!"});
        }
        
        // tim refresh token trong db
        const foundToken = await RefreshToken.findTokenByValue(refreshToken);
        if (!foundToken) {
            return res.status(401).json({message: "Invalid refresh token!"});
        }
        

        //tao access token moi
        const newAccessToken = jwtConfig.generateAccessToken({
            id: decoded.id, username: decoded.username, role: decoded.role});

        //luu refresh token moi vao db
        // await RefreshToken.createRefreshToken(refreshToken);

        res.status(200).json({message: "Refresh token successfully!", token: newAccessToken, refreshToken: refreshToken});
    } catch (error) {
        res.status(500).json({message: "Error when refreshing token!", error: error.message});
    }
}
