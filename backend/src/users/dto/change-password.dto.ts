import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ example: 'oldPassword123', description: 'Mật khẩu hiện tại' })
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @ApiProperty({ example: 'newPassword123', description: 'Mật khẩu mới' })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
