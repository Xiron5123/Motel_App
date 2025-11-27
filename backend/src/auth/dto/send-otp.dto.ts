import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOTPDto {
    @ApiProperty({
        description: 'Email để nhận OTP',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
}
