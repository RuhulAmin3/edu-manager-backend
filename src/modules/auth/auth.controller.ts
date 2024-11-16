import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ForgotPasswordDTO,
  LoginUserDto,
  ResetPasswordDTO,
  UpdatePasswordDTO,
} from './dto';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from './decorator/public.decorator';
import { HasRoles } from './decorator/roles.decorator';
import { ROLE } from '@prisma/client';
import { apiResponse } from 'src/utils/api-response';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  async loginUser(
    @Body() loginUserData: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...others } =
      await this.authService.LoginUser(loginUserData);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 20 * 24 * 60 * 60 * 1000, // 20 day
      // maxAge: 20 * 1000, // 20 seconds
    });
    return others;
  }

  @Public()
  @Post('/refresh-token')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    const result = await this.authService.refreshToken(refreshToken);

    return result;
  }

  @Post('/update-password')
  @HasRoles(ROLE.ADMIN, ROLE.GUARDIAN, ROLE.STUDENT, ROLE.TEACHER)
  async updatePassword(
    @Body() data: UpdatePasswordDTO,
    @Req()
    req: Request,
  ) {
    const { userId } = req.user;

    const result = await this.authService.updatePassword(
      userId,
      data.oldPassword,
      data.newPassword,
    );
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'password updated successfully',
    });
    return response;
  }
  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() data: ForgotPasswordDTO) {
    await this.authService.forgotPassword(data.id);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      message: 'Check your email to get the reset link',
    });
    return response;
  }

  @Post('/reset-password')
  @Public()
  async resetPassword(@Body() data: ResetPasswordDTO, @Req() req: Request) {
    const token = req.headers.authorization || '';
    await this.authService.resetPassword(data.userId, data.newPassword, token);
    const response = apiResponse({
      statusCode: HttpStatus.OK,
      message:
        'Password reset successfully. Now you can login with your new password',
    });
    return response;
  }
}
