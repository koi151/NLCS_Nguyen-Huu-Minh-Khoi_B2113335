import { Request, Response, NextFunction } from 'express';
import ClientAccount from '../../api/v1/models/clientAccount.model';
import { verifyToken } from '../../helpers/auth.methods';

export const authRequire = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get access token from header
    const { clientAccessToken } = req.cookies;

    if (!clientAccessToken) {
      return res.status(400).json({
        code: 400,
        message: 'No access token found.'
      });
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified: any = await verifyToken(
      clientAccessToken,
      accessTokenSecret,
    );

    if (!verified) {
      return res.status(401).json({
        code: 401,
        message: "You don't have permission to access this feature"
      });
    }

    // Fetch user
    const user = await ClientAccount.findOne(
      { _id: verified.payload.username }
    ).select('-password -token');

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: 'User not found'
      });
    }

    res.locals.currentUserClient = user;

    return next();

  } catch (error) {
    console.error('Error in authRequire middleware:', error);
    return res.status(401).json({
      code: 401,
      message: 'Authorization failed'
    });
  }
};
