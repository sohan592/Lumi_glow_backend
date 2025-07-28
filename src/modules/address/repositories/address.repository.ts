import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AddressEntity, AddressType } from '../entity/address.entity';
import { CreateAddressDto } from '../dto/address.dto';
import { AddressDefaultType } from '../address.controller';
import { CheckoutEntity } from '../../checkout/entity/checkout.entity';

@Injectable()
export class AddressRepository extends Repository<AddressEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(AddressEntity, dataSource.createEntityManager());
  }

  async createAddress(
    userId: number,
    dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return this.manager.transaction(async (manager) => {
      // If new address is default, unset other default addresses
      if (dto.isDefaultShipping) {
        await manager.update(
          AddressEntity,
          { user: { id: userId } },
          { isDefaultShipping: false },
        );
      }

      if (dto.isDefaultBilling) {
        await manager.update(
          AddressEntity,
          { user: { id: userId } },
          { isDefaultBilling: false },
        );
      }

      // If this is first address, make it default
      const addressCount = await manager.count(AddressEntity, {
        where: { user: { id: userId } },
      });

      const address = manager.create(AddressEntity, {
        ...dto,
        user: { id: userId },
        isDefaultShipping: dto.isDefaultShipping || addressCount === 0,
        isDefaultBilling: dto.isDefaultBilling || addressCount === 0,
      });

      return manager.save(AddressEntity, address);
    });
  }

  async updateAddress(
    userId: number,
    addressId: number,
    dto: Partial<CreateAddressDto>,
  ): Promise<AddressEntity> {
    return this.manager.transaction(async (manager) => {
      const address = await manager.findOne(AddressEntity, {
        where: { id: addressId, user: { id: userId } },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      // Handle default address changes
      if (
        (dto.isDefaultShipping && !address.isDefaultShipping) ||
        (dto.isDefaultBilling && !address.isDefaultBilling)
      ) {
        const updates = [];
        if (dto.isDefaultShipping) {
          updates.push(
            manager.update(
              AddressEntity,
              { user: { id: userId } },
              { isDefaultShipping: false },
            ),
          );
        }
        if (dto.isDefaultBilling) {
          updates.push(
            manager.update(
              AddressEntity,
              { user: { id: userId } },
              { isDefaultBilling: false },
            ),
          );
        }
        await Promise.all(updates);
      }

      Object.assign(address, dto);
      return manager.save(AddressEntity, address);
    });
  }

  async findAddresses(
    userId: number,
    options?: {
      type?: AddressType;
    },
  ): Promise<AddressEntity[]> {
    const where: any = { user: { id: userId }, deletedAt: IsNull() };

    if (options?.type) where.type = options.type;

    return this.find({
      where,
      order: {
        isDefaultShipping: 'DESC',
        isDefaultBilling: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOneAddress(
    userId: number,
    addressId: number,
  ): Promise<AddressEntity> {
    const address = await this.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async setDefaultAddress(
    userId: number,
    addressId: number,
    type: AddressDefaultType,
  ): Promise<void> {
    return this.manager.transaction(async (manager) => {
      const address = await manager.findOne(AddressEntity, {
        where: { id: addressId, user: { id: userId } },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      if (type === AddressDefaultType.BILLING) {
        await manager.update(
          AddressEntity,
          { user: { id: userId } },
          { isDefaultBilling: false },
        );
        await manager.update(
          AddressEntity,
          { id: addressId },
          { isDefaultBilling: true },
        );
        return;
      }

      if (type === AddressDefaultType.SHIPPING) {
        await manager.update(
          AddressEntity,
          { user: { id: userId }, isDefault: true },
          { isDefaultShipping: false },
        );

        await manager.update(
          AddressEntity,
          { id: addressId },
          { isDefaultShipping: true },
        );
      }
    });
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    // If deleted address was default, set oldest active address as default
    const deletedAddress = await this.findOne({
      where: { id: addressId },
    });

    const isAddressInCheckout = await this.manager.exists(CheckoutEntity, {
      where: [
        { billingAddress: { id: addressId } },
        { shippingAddress: { id: addressId } },
      ],
    });

    if (deletedAddress?.isDefaultShipping) {
      const newDefault = await this.findOne({
        where: { user: { id: userId }, id: Not(addressId) },
        order: { createdAt: 'ASC' },
      });

      if (newDefault) {
        await this.update({ id: newDefault.id }, { isDefaultShipping: true });
      }
    }
    if (deletedAddress?.isDefaultBilling) {
      const newDefaultBill = await this.findOne({
        where: { user: { id: userId }, id: Not(addressId) },
        order: { createdAt: 'ASC' },
      });

      if (newDefaultBill) {
        await this.update(
          { id: newDefaultBill.id },
          { isDefaultBilling: true },
        );
      }
    }

    if (isAddressInCheckout) {
      this.update({ id: addressId }, { deletedAt: new Date() });
    } else {
      const result = await this.delete({ id: addressId, user: { id: userId } });

      if (!result.affected) {
        throw new NotFoundException('Address not found');
      }
    }
  }

  async validateAddressOwnership(
    userId: number,
    addressId: number,
  ): Promise<boolean> {
    const count = await this.count({
      where: { id: addressId, user: { id: userId } },
    });
    return count > 0;
  }
}
