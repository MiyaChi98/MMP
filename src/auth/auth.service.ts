import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Variable } from "src/variable";
import * as bcrypt from "bcrypt";
import { AuthDto } from "src/dto/auth.dto";
import { Role } from "src/constant/roleEnum";
import { Register } from "src/dto/register.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schema/user.schema";
import { Model } from "mongoose";

@Injectable()
export class AuthService {
  //Take in jwt and UserService that imported from User module
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  //SIGN UP
  //Input: User DTO
  //Output: New user
  async signUp(createUserDTO: Register) {
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
      zone: Role.STUDENT,
    });
    return newUser;
  }

  //SIGN IN
  //Input: AuthDTO that contains email and password
  //Output: Access Token and Refresh Token
  async signIn(authDTO: AuthDto) {
    //Find one user with the input email
    const user = await this.userService.findOne(authDTO.email);
    if (!user) throw new BadRequestException("User does not exist");
    //Check if password is match or not
    const passwordMatches = bcrypt.compareSync(authDTO.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException("Password is incorrect");
    //Genarate new at and rt
    const tokens = await this.getTokens(user._id.toString(), user.zone);
    const userDetail = {
      userID: user._id,
      name: user.name,
      email: user.email,
      zone: user.zone,
      phone: user.phone,
      ...tokens,
    };
    //Add refresh token value to the DB
    await this.userService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
    );
    return userDetail;
  }

  //SIGN OUT
  //Input: userID
  //Output: Delete the refresh token
  async signOut(userId: string) {
    if (userId) await this.userService.signOut(userId);
    return "Logout success";
  }
  //Get new access token
  async getnewAccessToken(userId: string, rt: string) {
    const user = await this.UserModel.findOne(
      { _id: userId },
      {
        password: 0,
      },
    );
    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Access Denied");
    }
    if (user.refreshToken === rt) {
      const tokens: any = await this.getTokens(user._id.toString(), user.zone);
      const userDetail = {
        userID: user._id,
        name: user.name,
        email: user.email,
        zone: user.zone,
        phone: user.phone,
        ...tokens,
      };
      return userDetail;
    } else throw new ForbiddenException("Access Denied");
  }

  //GET TOKENS
  //Input: userID as sub and username
  //Output : Access Token (2m) and Refresh Token (1d)
  async getTokens(userId: string, userzone: Role[]) {
    // return an array ontains at and rt
    const [accessToken, refreshToken] = await Promise.all([
      // Sign new AT
      this.jwtService.signAsync(
        {
          sub: userId,
          zone: userzone,
        },
        {
          secret: Variable.AT_SECRET,
          expiresIn: "20m",
        },
      ),
      //Sign new RT
      this.jwtService.signAsync(
        {
          sub: userId,
          zone: userzone,
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
    const number = /[0-9]/;
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    const upperCase = /[A-Z]/;
    // eslint-disable-next-line prefer-const
    let err = [];
    if (password.length < 8) {
      err.push("The password should have at least 8 characters");
    } else {
      if (!upperCase.test(password)) {
        err.push("The password should have at least one uppercase letter");
      }

      if (!number.test(password)) {
        err.push("The password should have at least one number");
      }

      if (!specialChars.test(password)) {
        err.push("The password should have at least one special character");
      }
    }
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
