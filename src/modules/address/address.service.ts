import { Injectable } from '@nestjs/common';
import { AddressRepository } from './repositories/address.repository';
import { CreateAddressDto } from './dto/address.dto';
import { AddressEntity, AddressType } from './entity/address.entity';
import { AddressDefaultType } from './address.controller';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(userId: number, dto: CreateAddressDto): Promise<AddressEntity> {
    return this.addressRepository.createAddress(userId, dto);
  }

  async update(
    userId: number,
    addressId: number,
    dto: Partial<CreateAddressDto>,
  ): Promise<AddressEntity> {
    return this.addressRepository.updateAddress(userId, addressId, dto);
  }

  async findAll(
    userId: number,
    options?: {
      type?: AddressType;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ): Promise<AddressEntity[]> {
    return this.addressRepository.findAddresses(userId, options);
  }

  async findOne(userId: number, addressId: number): Promise<AddressEntity> {
    return this.addressRepository.findOneAddress(userId, addressId);
  }

  async setDefault(
    userId: number,
    addressId: number,
    type: AddressDefaultType,
  ): Promise<void> {
    return this.addressRepository.setDefaultAddress(userId, addressId, type);
  }

  async remove(userId: number, addressId: number): Promise<void> {
    return this.addressRepository.deleteAddress(userId, addressId);
  }

  async findDefaultAddress(userId: number): Promise<AddressEntity | null> {
    const addresses = await this.addressRepository.findAddresses(userId, {});
    return addresses[0] || null;
  }

  async validateOwnership(userId: number, addressId: number): Promise<boolean> {
    return this.addressRepository.validateAddressOwnership(userId, addressId);
  }
}
