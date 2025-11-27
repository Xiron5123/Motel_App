import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOTPDto {
    @ApiProperty({
        description: 'Email đã đăng ký',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty({
        description: 'Mã OTP 6 chữ số',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    })
    @IsString({ message: 'OTP phải là chuỗi ký tự' })
    @Length(6, 6, { message: 'OTP phải có đúng 6 chữ số' })
    otp: string;
}
