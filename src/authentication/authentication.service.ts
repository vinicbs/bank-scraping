import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import TokenData from '../interfaces/tokenData.interface';
import CreateUserDto from '../users/users.dto';
import User from '../users/users.interface';
import userModel from '../users/users.model';

class AuthenticationService {
	public user = userModel;

	public async register(userData: CreateUserDto) {
		if (
			await this.user.findOne({ email: userData.email })
		) {
			throw 'Ja existe algum usuario com esse email'
		}
		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const user = await this.user.create({
			...userData,
			password: hashedPassword,
		});
		user.password = undefined;
		const tokenData = this.createToken(user);
		const cookie = this.createCookie(tokenData);
		return {
			cookie,
			user,
		};
	}

	public createCookie(tokenData: TokenData) {
		return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; Path=/`;
	}

	public createToken(user: User): TokenData {
		const expiresIn = 60 * 60; // an hour
		const secret = process.env.JWT_SECRET;
		const dataStoredInToken: DataStoredInToken = {
			_id: user._id,
		};
		return {
			expiresIn,
			token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
		};
	}
}

export default AuthenticationService;
