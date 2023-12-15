import { Controller, Get, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/dto/createUser.dto";
import { AuthDto } from "src/dto/auth.dto";
import { Request } from "express";
import { ATGuard } from "src/guard/accessToken.guards";
import { RTGuard } from "src/guard/refreshToken.guards";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //REGISTER
  //Input: A DTO that resembles User collection in DB
  //Output: A new user
  @Post("register")
  async register(@Body() createUserDTO: CreateUserDto) {
    return await this.authService.signUp(createUserDTO);
  }
  //LOGIN
  //Input: AuthDTO contains email and password
  //Output: tokens
  @Post("login")
  async login(@Body() authDTO: AuthDto) {
    return await this.authService.signIn(authDTO);
  }
  //LOGOUT
  //Guard to check Access Token
  @UseGuards(ATGuard)
  @Get("logout")
  async logout(@Req() req: Request) {
    return await this.authService.signOut(req["user"]?.sub);
  }
  //Take new access token
  @UseGuards(RTGuard)
  @Get("acstoken")
  async getnewAccessToken(@Req() req: Request) {
    if (req["user"]) {
      return await this.authService.getnewAccessToken(
        req["user"]?.sub,
        req["user"]?.rt,
      );
    }
  }
}
