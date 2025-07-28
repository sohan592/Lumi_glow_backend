import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/address.dto';
import { AddressEntity } from './entity/address.entity';

export enum AddressDefaultType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}
@ApiTags('User | Address')
@Controller({
  path: 'address',
  version: '1',
})
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create address' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressEntity })
  async create(
    @Req() req: Request,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return this.addressService.create(req.user['id'], dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressEntity] })
  async findAll(@Req() req: Request): Promise<AddressEntity[]> {
    return this.addressService.findAll(req.user['id']);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: AddressEntity })
  async findOne(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressEntity> {
    return this.addressService.findOne(req.user['id'], id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: HttpStatus.OK, type: AddressEntity })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return this.addressService.update(req.user['id'], id, dto);
  }

  @Patch(':id/:type/default')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Set address as default shipping or billing' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({
    name: 'type',
    enum: AddressDefaultType,
    description: 'Type of default address (shipping/billing)',
  })
  async setDefault(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Param('type') type: AddressDefaultType,
  ): Promise<void> {
    return this.addressService.setDefault(req.user['id'], id, type);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.addressService.remove(req.user['id'], id);
  }
}
