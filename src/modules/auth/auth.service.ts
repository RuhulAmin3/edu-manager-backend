import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ROLE } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  public async validateUser(userId: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { studentId: userId },
          { teacherId: userId },
          { guardianId: userId },
        ],
      },
    });

    if (user && (await this.verifyPassword(user.password, password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  public async LoginUser(loginUserData: LoginUserDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { studentId: loginUserData.userId },
          { teacherId: loginUserData.userId },
          { guardianId: loginUserData.userId },
        ],
      },
    });
    if (!user) throw new NotFoundException('user not found');
    try {
      const checkPassword = await this.verifyPassword(
        user.password,
        loginUserData.password,
      );
      if (checkPassword) {
        const payload = {
          userId: user.id,
          role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        return {
          accessToken,
          refreshToken,
          needPasswordChange: user.needPasswordChange,
        };
      } else {
        throw new UnauthorizedException('wrong credientials');
      }
    } catch (error) {
      throw error;
    }
  }

  public async refreshToken(token: string) {
    let verifiedToken = null;
    try {
      verifiedToken = await this.jwtService.verifyAsync(token);
    } catch (err) {
      throw new ForbiddenException('invalid token');
    }
    const { userId } = verifiedToken;
    const isUserExist = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) throw new NotFoundException('user does not exist');

    const newAccessToken = await this.jwtService.signAsync({
      userId: isUserExist.id,
      role: isUserExist.role,
    });

    return { accessToken: newAccessToken };
  }

  public async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const isUserExist = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: true,
        needPasswordChange: true,
      },
    });

    if (!isUserExist) throw new BadRequestException('user does not exist');

    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      isUserExist.password,
    );
    if (!isPasswordMatched) {
      throw new BadRequestException('old password is incorrect');
    }
    const hashedPassword = await bcrypt.hash(
      newPassword,
      +this.configService.get('JWT.bcrypt_solt_level'),
    );

    const updateUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
        needPasswordChange: false,
        passwordChangeAt: new Date(),
      },
    });

    return updateUser;
  }

  public async forgotPassword(userId: string) {
    const isUserExist = await this.prisma.user.findFirst({
      where: {
        OR: [
          { studentId: userId },
          { teacherId: userId },
          { guardianId: userId },
        ],
      },
    });

    if (!isUserExist) throw new BadRequestException('user not found');

    let profileInfo = null;
    if (isUserExist.role === ROLE.TEACHER) {
      profileInfo = await this.prisma.teacher.findUnique({
        where: { teacherId: userId },
      });
    } else if (isUserExist.role === ROLE.GUARDIAN) {
      profileInfo = await this.prisma.guardian.findUnique({
        where: { guardianId: userId },
      });
    } else if (isUserExist.role === ROLE.STUDENT) {
      profileInfo = await this.prisma.student.findUnique({
        where: { studentId: userId },
      });
    }

    if (!profileInfo) throw new BadRequestException('profile not found');
    if (!profileInfo.email)
      throw new BadRequestException('recovered email not found');

    const payload = {
      id:
        isUserExist.guardianId ||
        isUserExist.studentId ||
        isUserExist.guardianId,
    };
    const passResetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
    });

    const resetLink = `http://localhost:4000/token=${passResetToken}`;

    await this.mailService.sendMail({
      from: this.configService.get('MAIL.MAIL_USER'),
      to: profileInfo.email,
      subject: 'Password Reset Link',
      html: `<div>
      <p>Hi, ${profileInfo?.name?.firstName}</p>
      <p>Your password reset link: <a href=${resetLink}>Click Here</a></p>
      <p>Thank you</p>
    </div>`,
    });
  }

  public async resetPassword(
    userId: string, // Id must be custom Id e.g T-00001
    newPassword: string,
    token: string,
  ) {
    const [, resetToken] = token.split(' ');
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { studentId: userId },
          { teacherId: userId },
          { guardianId: userId },
        ],
      },
    });

    if (!user) throw new BadRequestException('user not found');

    const isVarified = await this.jwtService.verifyAsync(resetToken);

    if (!isVarified) throw new BadRequestException('token invalid');
    const hashedPassword = await bcrypt.hash(
      newPassword,
      +this.configService.get('JWT.bcrypt_solt_level'),
    );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  private async verifyPassword(hashedPassword: string, textPassword: string) {
    const isPasswordMatched = await bcrypt.compare(
      textPassword,
      hashedPassword,
    );
    if (!isPasswordMatched) {
      throw new BadRequestException('wrong crediential provided');
    }
    return isPasswordMatched;
  }
}
