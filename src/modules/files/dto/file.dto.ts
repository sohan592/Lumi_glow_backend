import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class FileDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  // @ApiProperty()
  // @IsOptional()
  path: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // name: string;

  // @ApiProperty({ required: false })
  // @IsString()
  // @IsOptional()
  // alt?: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // filetype: string;

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // size: number;

  // @ApiProperty()
  // @IsOptional()
  // createdAt: Date;

  // @ApiProperty()
  // @IsOptional()
  // updatedAt: Date;

  // @ApiProperty({ required: false })
  // @IsOptional()
  // deletedAt?: Date;
}
