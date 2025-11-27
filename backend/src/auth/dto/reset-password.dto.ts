import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token đặt lại mật khẩu từ email',
        example: 'abc123def456...',
    })
    @IsString({ message: 'Token phải là chuỗi ký tự' })
    token: string;

    @ApiProperty({
        description: 'Mật khẩu mới',
        example: 'NewPassword123',
        minLength: 6,
    })
    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}
