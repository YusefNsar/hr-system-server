import { Body, Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { AuthService, JWTPayload } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SkipAuth } from './auth.guard';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipAuth()
  @HttpCode(200)
  @Post('signin')
  signIn(@Body() signInDto: SigninDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get('profile')
  async getProfile(@Request() req: { user: JWTPayload }) {
    return this.authService.getProfile(req.user.id.toString());
  }

  @SkipAuth()
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signUp(
      signupDto.email,
      signupDto.name,
      signupDto.password,
    );
  }
}
