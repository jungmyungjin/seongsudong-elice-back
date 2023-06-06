import jwt, { VerifyErrors } from 'jsonwebtoken';
import { User } from '../controllers/members-controllers';

const secretKey = process.env.JWT_SECRET_KEY;
const expiresIn = '1h';

export const generateToken = (userInfo: User): string => {
    const payload = {
        email: userInfo.email,
        name: userInfo.name,
        generation: userInfo.generation,
        isAdmin: userInfo.isAdmin,
    };

    if (!secretKey) {
        throw new Error('JWT secret key is not configured');
    }

    return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = (token: string): User | null => {
    try {
        if (!secretKey) {
            throw new Error('JWT secret key is not configured');
        }

        const decoded = jwt.verify(token, secretKey) as User;
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

export const refreshToken = (token: string): string | null => {
    try {
        const decoded = verifyToken(token);
        if (decoded) {
            return generateToken(decoded);
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};

