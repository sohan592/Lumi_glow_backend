import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FaceAnalysisService } from './face-analysis.service';
import { CreateFaceAnalysisDto } from './dto/create-face-analysis.dto';
import { UpdateFaceAnalysisDto } from './dto/update-face-analysis.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import {
  FaceAnalysisDtoResponse,
  FileUploadDto,
  ImageUrlDto,
} from './dto/others.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Request } from 'express';
import { FaceAnalysisLog } from './entities/face-analysis.entity';
import { ProductEntity } from '../products/entity/product.entity';

@ApiTags('Face Analysis')
@Controller({
  path: 'face-analysis',
  version: '1',
})
export class FaceAnalysisController {
  constructor(private readonly faceAnalysisService: FaceAnalysisService) {}

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('upload')
  @ApiOperation({ summary: 'Analyze skin from uploaded image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload image for analysis',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Skin analysis result',
    type: FaceAnalysisDtoResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image format or other error',
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow all image types by checking if the MIME type starts with 'image/'
        const isImage = file.mimetype.startsWith('image/');
        if (!isImage) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        // Skip the next check as we've already verified it's an image
        return callback(null, true);
      },
      limits: {
        fileSize: 15 * 1024 * 1024, // Soft limit, actual resize handled in service
      },
    }),
  )
  async analyzeFromUpload(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const userId = req.user['id'];

    const filePath = path.resolve(file.path);
    return await this.faceAnalysisService.analyzeSkinFromFile(userId, filePath);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('url')
  @ApiOperation({ summary: 'Analyze skin from image URL' })
  @ApiBody({
    description: 'URL of the image for analysis',
    type: ImageUrlDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Skin analysis result',
    type: FaceAnalysisDtoResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image URL or other error',
  })
  async analyzeFromUrl(@Req() req: Request, @Body() imageUrlDto: ImageUrlDto) {
    if (!imageUrlDto.imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    const userId = req.user['id'];

    return await this.faceAnalysisService.analyzeSkinFromUrl(
      userId,
      imageUrlDto.imageUrl,
    );
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('recent')
  @ApiOperation({
    summary: "Get user's face analysis records from the last 7 days",
  })
  @ApiResponse({
    status: 200,
    description: 'Recent analysis records retrieved successfully',
    type: [FaceAnalysisLog],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserRecentAnalyses(@Req() req: Request) {
    const userId = req.user['id'];

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.faceAnalysisService.getUserRecentAnalyses(userId);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('product-suggestions')
  @ApiOperation({
    summary: "Get product suggestions based on user's recent face analysis",
    description:
      "Returns 20 products prioritizing matches with skin conditions from user's last scan",
  })
  @ApiResponse({
    status: 200,
    description: 'Product suggestions retrieved successfully',
    type: [ProductEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProductSuggestions(@Req() req: Request) {
    const userId = req.user['id'];

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.faceAnalysisService.suggestProductsFromLastScan(userId);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('scan-count')
  @ApiOperation({
    summary: "Get user's face analysis scan count for current month",
    description:
      'Returns the number of scans performed by the user in the current month',
  })
  @ApiResponse({
    status: 200,
    description: 'Scan count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of scans performed in the current month',
          example: 1,
        },
        limit: {
          type: 'number',
          description: 'Maximum scans allowed per month',
          example: 2,
        },
        remaining: {
          type: 'number',
          description: 'Remaining scans for the current month',
          example: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserScanCount(@Req() req: Request) {
    const userId = req.user['id'];

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const count =
      await this.faceAnalysisService.getUserScanCountForCurrentMonth(userId);
    const limit = 2; // Maximum number of scans per month
    const remaining = Math.max(0, limit - count);

    return {
      count,
      limit,
      remaining,
    };
  }
}
