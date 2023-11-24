import jwt from 'jsonwebtoken';

let success = false;

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!token) {
        success = false;
        return res.status(401).json({ success: success, error: "Please authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data;
        next();
    } catch (error) {
        success = false;
        return res.status(401).json({ success: success, error: "Please authenticate using a valid token" })
    }
}

export default fetchuser;