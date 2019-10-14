import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from '../utils/config';
// Interfaces
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
// Users
import userModel from '../users/users.model';

async function authViewMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
	const cookies = request.cookies;
	if (cookies && cookies.Authorization) {
		try {
			const verificationResponse = jwt.verify(cookies.Authorization, config.JWT_SECRET) as DataStoredInToken;
			const id = verificationResponse._id;
			const user = await userModel.findById(id);
			if (user) {
				request.user = user;
				next();
			} else {
				response.render('login');
			}
		} catch (error) {
			response.render('login');
		}
	} else {
		response.render('login');
	}
}

export default authViewMiddleware;
