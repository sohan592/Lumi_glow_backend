import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Response,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParseJsonArrayPipe } from '@utils/pipes/parse-json-array.pipe';
import { ParseJsonPipe } from '@utils/pipes/parse-json.pipe';
import { MediaEntity } from './entity/file.entity';
import { MediaService } from './media.service';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Media')
@Controller({
  path: 'media',
  version: '1',
})
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('upload/single')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        metadata: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            alt: { type: 'string' },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('metadata', new ParseJsonPipe()) metadata: any,
    @Req() req: Request,
  ): Promise<any> {
    console.log('req', req.user);
    return this.mediaService.uploadFile(file, metadata, req.user['id']);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('upload/multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        metadata: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              alt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata', new ParseJsonArrayPipe()) metadata?: any[],
  ): Promise<MediaEntity[]> {
    return this.mediaService.uploadFiles(files, metadata, req.user['id']);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: MediaEntity })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MediaEntity> {
    return this.mediaService.findById(id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200 })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mediaService.delete(id);
  }

  @Get()
  @ApiResponse({ status: 200, type: [MediaEntity] })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({ name: 'roleId', type: 'number', required: false })
  async findAll(
    @Req() req: Request,
  ): Promise<{ data: MediaEntity[]; count: number }> {
    const { page = 1, limit = 10, search, roleId = 1 } = req.query;
    return this.mediaService.findAll(+page, +limit, search as string, +roleId);
  }

  @Get('single/:path')
  @ApiExcludeEndpoint()
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './uploads' });
  }

  @Post('by-ids')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  })
  async findByIds(@Body('ids') ids: string[]): Promise<MediaEntity[]> {
    return this.mediaService.findByIds(ids);
  }
}
