import { ApiProperty } from '@nestjs/swagger';

export class FaceAnalysisDtoResponse {
  @ApiProperty()
  request_id: string;

  @ApiProperty()
  time_used: number;

  @ApiProperty()
  result: any; // you can define specific types here based on the response structure you expect

  @ApiProperty()
  warning: string[];

  @ApiProperty()
  face_rectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

// Create DTO for image URL request
export class ImageUrlDto {
  @ApiProperty({
    description: 'URL of the image to analyze',
    example: 'https://example.com/image.jpg',
  })
  imageUrl: string;
}

// Create DTO for file upload
export class FileUploadDto {
  @ApiProperty({
    description: 'Image file to analyze',
    type: 'string',
    format: 'binary',
  })
  image: any;
}
