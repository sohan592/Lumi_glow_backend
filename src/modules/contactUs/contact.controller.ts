import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ContactService } from './contact.service';
import { ContactEntity } from './entity/contact.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  QueryContactDto,
} from './dto/contact.dto';

@ApiTags('Contact Management')
@Controller({
  path: 'contact-management',
  version: '1',
})
@ApiBearerAuth()
@Roles(RoleEnum.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contacts (Admin)' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    example: JSON.stringify({
      name: 'John',
      email: 'john@example.com',
      status: [{ id: 1 }],
    }),
  })
  async findAll(@Query() query: QueryContactDto) {
    const { page = 1, limit = 10, filters, sort } = query;
    return this.contactService.findManyWithPagination({
      filterOptions: filters,
      sortOptions: sort,
      paginationOptions: { page, limit },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ContactEntity })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ContactEntity> {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ContactEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactDto,
  ): Promise<ContactEntity> {
    return this.contactService.update(id, dto);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete contacts (Admin)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ): Promise<void> {
    return this.contactService.remove(ids);
  }

  @Patch('status')
  @ApiOperation({ summary: 'Update contacts status (Admin)' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateStatus(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('statusId', ParseIntPipe) statusId: number,
  ): Promise<void> {
    return this.contactService.updateStatus(ids, statusId);
  }
}

@ApiTags('Contact')
@Controller({
  path: 'contact',
  version: '1',
})
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ContactEntity })
  async create(@Body() dto: CreateContactDto): Promise<ContactEntity> {
    return this.contactService.create(dto);
  }
}
