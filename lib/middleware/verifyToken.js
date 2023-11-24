import jwt from 'jsonwebtoken';

const verifyToken = (token) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!token) {
        return false;
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        return data;
    } catch (error) {
        return false;
    }
}

export default verifyToken;