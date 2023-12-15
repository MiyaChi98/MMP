import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Variable } from "src/variable";
import { CreateUserDTO } from "src/dto/createUser.dto";
import * as bcrypt from "bcrypt";
import { AuthDTO } from "src/dto/auth.dto";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

@Injectable()
export class AuthService {
  //Take in jwt and UserService that imported from User module
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  //SIGN UP
  //Input: User DTO
  //Output: New user
  async signUp(createUserDTO: CreateUserDTO) {
    //check if there any user was signed with input email
    const userExist = await this.userService.findOne(createUserDTO.email);
    if (userExist) {
      throw new BadRequestException("User already exist by this email!");
    }
    //Validate the input password using a validate method
    this.validatePassword(createUserDTO.password);
    //Hash the password
    const hash = this.hash(createUserDTO.password);
    //Create new user then return it
    const newUser = await this.userService.create({
      ...createUserDTO,
      password: hash,
    });
    return newUser;
  }

  //SIGN IN
  //Input: AuthDTO that contains email and password
  //Output: Access Token and Refresh Token
  async signIn(authDTO: AuthDTO) {
    //Find one user with the input email
    const user = await this.userService.findOne(authDTO.email);
    if (!user) throw new BadRequestException("User does not exist");
    //Check if password is match or not
    const passwordMatches = bcrypt.compareSync(authDTO.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException("Password is incorrect");
    //Genarate new at and rt
    const tokens = await this.getTokens(user.userId, user.name);
    //Add refresh token value to the DB
    await this.userService.updateRefreshToken(user.userId, tokens.refreshToken);
    return tokens;
  }

  //SIGN OUT
  //Input: userID
  //Output: Delete the refresh token
  async signOut(userId: number) {
    return this.userService.signOut(userId);
  }
  //Get new access token
  async getnewAccessToken(userId: number, rt: string) {
    const user = await this.userService.findOnebyID(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException("Access Denied");
    const isMatch = user.refreshToken === rt ? true : false;
    if (!isMatch) throw new ForbiddenException("Access Denied");
    const tokens = await this.getTokens(user.userId, user.name);
    return tokens;
  }

  //GET TOKENS
  //Input: userID as sub and username
  //Output : Access Token (2m) and Refresh Token (1d)
  async getTokens(userId: number, username: string) {
    // return an array ontains at and rt
    const [accessToken, refreshToken] = await Promise.all([
      // Sign new AT
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: Variable.AT_SECRET,
          expiresIn: "2m",
        },
      ),
      //Sign new RT
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: Variable.RT_SECRET,
          expiresIn: "1d",
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // VALIDATE PASSWORD
  validatePassword(password: string) {
    //Have more than 8 char
    // >=1 upper case
    // have a number
    // have a special char
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    const err = [];
    password.length >= 8
      ? /[A-Z]/.test(password)
        ? /[0-9]/.test(password)
          ? specialChars.test(password)
            ? ""
            : err.push("The password should have at least one special char")
          : err.push("The password should have at least a number")
        : err.push("The password should have at least one Upper Case letter")
      : err.push("The password should greater than 8 char");

    if (err.length != 0) {
      throw new BadRequestException(err);
    }
  }

  // HASH using bycrypt
  hash(password) {
    const sOr = 10;
    const hash = bcrypt.hashSync(password, sOr);
    return hash;
  }
}
