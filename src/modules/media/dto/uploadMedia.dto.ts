import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for individual file metadata
export class FileMetadataDto {
  @ApiProperty({
    example: 'My file',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alt?: string;
}

// DTO for uploading multiple files
export class UploadMultipleMediaDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: Express.Multer.File[];

  @ApiPropertyOptional({ type: [FileMetadataDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  fileMetadata?: FileMetadataDto[];
}
