import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from '../utils/config';
// Exceptions
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
// Interfaces
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
// Users
import userModel from '../users/users.model';

async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
	const cookies = request.cookies;
	if (cookies && cookies.Authorization) {
		try {
			const verificationResponse = jwt.verify(cookies.Authorization, config.JWT_SECRET) as DataStoredInToken;
			const id = verificationResponse._id;
			const user = await userModel.findById(id);
			if (user) {
				response.locals.user = user;
				next();
			} else {
				next(new WrongAuthenticationTokenException());
			}
		} catch (error) {
			next(new WrongAuthenticationTokenException());
		}
	} else {
		next(new AuthenticationTokenMissingException());
	}
}

export default authMiddleware;
