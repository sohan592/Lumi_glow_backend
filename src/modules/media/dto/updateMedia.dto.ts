import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'updated-profile-picture.jpg' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: '/uploads/images/updated-profile-picture.jpg',
  })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ example: 'Updated user profile picture' })
  @IsString()
  @IsOptional()
  alt?: string;
}
