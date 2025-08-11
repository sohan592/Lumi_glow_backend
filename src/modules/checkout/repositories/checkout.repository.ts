import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, ILike, In, Between } from 'typeorm';
import {
  CheckoutEntity,
  CheckoutItemEntity,
  CheckoutStatusHistoryEntity,
} from '../entity/checkout.entity';
import {
  CreateCheckoutDto,
  CreateCheckoutFromCartDto,
  FilterCheckoutDto,
  SortCheckoutDto,
  UpdateCheckoutDto,
} from '../dto/checkout.dto';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { NullableType } from '@utils/types/nullable.type';
import { PaymentStatus } from '../entity/checkout.entity';
import { CartEntity } from '@src/modules/cart/entity/cart.entity';
import {
  CouponEntity,
  DiscountType,
} from '@src/modules/coupons/entity/coupon.entity';
import { ProductEntity } from '@src/modules/products/entity/product.entity';
import { AddressEntity } from '@src/modules/address/entity/address.entity';

interface DashboardStats {
  todaySales: number;
  yesterdaySales: number;
  thisMonthSales: number;
  lastMonthSales: number;
  allTimeSales: number;
  totalOrders: number;
  ordersPending?: number;
  ordersCancelled?: number;
  ordersProcessing: number;
  ordersDelivered: number;
  top3ProductsLast3Months: Array<{
    productSnapshot: {
      id: string;
      name: string;
      sku: string;
      image: string;
    };
    totalValue: number;
    ratio: number;
  }>;
}

@Injectable()
export class CheckoutRepository {
  constructor(
    @InjectRepository(CheckoutEntity)
    private readonly checkoutRepository: Repository<CheckoutEntity>,
    @InjectRepository(CheckoutItemEntity)
    private readonly checkoutItemRepository: Repository<CheckoutItemEntity>,

    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,

    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,

    @InjectRepository(CheckoutStatusHistoryEntity)
    private readonly historyRepo: Repository<CheckoutStatusHistoryEntity>,
  ) {}

  async create(
    userId: number,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutEntity> {
    // Fetch product details
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
      relations: ['category', 'featureImage'],
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Some products not found');
    }

    const userDefaultBillingAddress = await this.addressRepository.findOne({
      where: { user: { id: userId }, isDefaultBilling: true },
    });

    const couponDetails = await this.couponRepository.findOne({
      where: { code: dto.couponCode },
      relations: ['products', 'categories', 'status'],
    });

    // Create checkout entity
    const checkout = this.checkoutRepository.create({
      user: { id: userId },
      billingAddress: {
        id: dto?.billingAddressId ?? userDefaultBillingAddress?.id,
      },
      shippingAddress: { id: dto.shippingAddressId },
      shippingMethod: { id: dto.shippingMethodId },
      paymentMethod: dto.paymentMethod,
      coupon: {
        id: couponDetails?.id,
      },
      notes: dto.notes,
      status: { id: 5 }, // Initial status (e.g., pending)
      orderNumber: `ORD-${Date.now()}-${userId}`,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    // Create checkout items
    const items = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return this.checkoutItemRepository.create({
        checkout: savedCheckout,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity,
        productSnapshot: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          image: product.featureImage?.path,
          category: product.category.id,
        },
        selectedAttributes: item.selectedAttributes,
      });
    });

    savedCheckout.items = await this.checkoutItemRepository.save(items);

    // Validate coupon
    if (dto.couponCode) {
      try {
        await this.validateCoupon(couponDetails, savedCheckout, userId);
      } catch (e) {
        // First, delete checkout items separately
        await this.checkoutItemRepository.delete({
          id: In(savedCheckout.items.map((item) => item.id)),
        });

        // Then, delete the checkout by its ID
        await this.checkoutRepository.delete(savedCheckout.id);

        throw new BadRequestException(e.message);
      }
    }

    // Calculate totals
    await this.calculateTotals(savedCheckout.id);

    return this.findById(savedCheckout.id);
  }

  async createFromCart(
    userId: number,
    dto: CreateCheckoutFromCartDto,
  ): Promise<CheckoutEntity> {
    // Get cart items
    const cartItems = await this.cartRepository.find({
      where: {
        id: In(dto.cartIds),
        user: { id: userId },
        isActive: true,
      },
      relations: ['product', 'product.featureImage', 'product.category'],
    });

    if (!cartItems.length) {
      throw new BadRequestException('No active cart items found');
    }

    const userDefaultBillingAddress = await this.addressRepository.findOne({
      where: { user: { id: userId }, isDefaultBilling: true },
    });

    const couponDetails = await this.couponRepository.findOne({
      where: { code: dto.couponCode },
      relations: ['products', 'categories', 'status'],
    });

    // Create checkout
    const checkout = this.checkoutRepository.create({
      orderNumber: `ORD-${Date.now()}-${userId}`,
      user: { id: userId },
      billingAddress: {
        id: dto?.billingAddressId ?? userDefaultBillingAddress?.id,
      },
      shippingAddress: { id: dto.shippingAddressId },
      shippingMethod: { id: dto.shippingMethodId },
      paymentMethod: dto.paymentMethod,
      coupon: {
        id: couponDetails?.id,
      },
      notes: dto.notes,
      status: { id: 5 }, // Pending status
      paymentStatus:
        dto?.paymentMethod === 'stripe'
          ? PaymentStatus.PAID
          : PaymentStatus.PENDING,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    // Create checkout items
    const checkoutItems = cartItems.map((cartItem) =>
      this.checkoutItemRepository.create({
        checkout: savedCheckout,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.price * cartItem.quantity,
        productSnapshot: {
          id: cartItem.product.id,
          name: cartItem.product.name,
          sku: cartItem.product.sku,
          image: cartItem.product.featureImage?.path,
          category: cartItem.product.category.id,
        },
        selectedAttributes: cartItem.selectedAttributes,
      }),
    );

    savedCheckout.items = await this.checkoutItemRepository.save(checkoutItems);

    // Validate coupon
    if (dto.couponCode) {
      try {
        await this.validateCoupon(couponDetails, savedCheckout, userId);
      } catch (e) {
        // First, delete checkout items separately
        await this.checkoutItemRepository.delete({
          id: In(checkoutItems.map((item) => item.id)),
        });

        // Then, delete the checkout by its ID
        await this.checkoutRepository.delete(savedCheckout.id);

        throw new BadRequestException(e.message);
      }
    }

    // Calculate totals
    await this.calculateTotals(savedCheckout.id);

    // Deactivate cart items
    await this.cartRepository.update(
      { id: In(dto.cartIds) },
      {
        isActive: false,
      },
    );

    return this.findById(savedCheckout.id);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterCheckoutDto | null;
    sortOptions?: SortCheckoutDto[] | null;
    paginationOptions: IPaginationOptions;
  }) {
    const where: FindOptionsWhere<CheckoutEntity> = {};

    if (filterOptions?.userId) {
      where.user = { id: filterOptions.userId };
    }

    if (filterOptions?.paymentStatus) {
      where.paymentStatus = filterOptions.paymentStatus;
    }

    if (filterOptions?.statusId) {
      where.status = { id: filterOptions.statusId };
    }

    if (filterOptions?.startDate && filterOptions?.endDate) {
      where.createdAt = Between(filterOptions.startDate, filterOptions.endDate);
    }

    if (filterOptions?.paymentStartDate && filterOptions?.paymentEndDate) {
      where.paidAt = Between(
        filterOptions.paymentStartDate,
        filterOptions.paymentEndDate,
      );
    }

    if (filterOptions?.customerName) {
      where.user = { firstName: ILike(`%${filterOptions.customerName}%`) };
    }

    if (filterOptions?.customerEmail) {
      where.user = { email: ILike(`%${filterOptions.customerEmail}%`) };
    }

    if (filterOptions?.location) {
      where.shippingAddress = {
        region: ILike(`%${filterOptions.location}%`),
        addressLine1: ILike(`%${filterOptions.location}%`),
      };
    }

    if (filterOptions?.productIds) {
      where.items = { productSnapshot: { id: In(filterOptions.productIds) } };
    }

    if (filterOptions?.categoryId) {
      where.items = {
        productSnapshot: { category: filterOptions.categoryId },
      };
    }
    console.log({
      sortOptions,
    });
    const [entities, total] = await this.checkoutRepository.findAndCount({
      where,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => ({ ...acc, [sort.orderBy]: sort.order }),
            {},
          )
        : { createdAt: 'DESC' },
      relations: [
        'user',
        'items',
        'billingAddress',
        'shippingAddress',
        'shippingMethod',
        'coupon',
        'status',
      ],
    });

    return { data: entities, total };
  }

  // async getDashboardStats(): Promise<DashboardStats> {
  //   const now = new Date();
  //   const todayStart = new Date(
  //     now.getFullYear(),
  //     now.getMonth(),
  //     now.getDate(),
  //   );
  //   const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  //   const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  //   const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  //   const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  //   // Calculate sales
  //   const [todaySales] = await this.checkoutRepository
  //     .createQueryBuilder('checkout')
  //     .select('COALESCE(SUM(checkout.total), 0)', 'sum')
  //     .where('checkout.createdAt >= :start', { start: todayStart })
  //     .getRawMany();

  //   const [yesterdaySales] = await this.checkoutRepository
  //     .createQueryBuilder('checkout')
  //     .select('COALESCE(SUM(checkout.total), 0)', 'sum')
  //     .where('checkout.createdAt >= :start AND checkout.createdAt < :end', {
  //       start: yesterdayStart,
  //       end: todayStart,
  //     })
  //     .getRawMany();

  //   const [thisMonthSales] = await this.checkoutRepository
  //     .createQueryBuilder('checkout')
  //     .select('COALESCE(SUM(checkout.total), 0)', 'sum')
  //     .where('checkout.createdAt >= :start', { start: monthStart })
  //     .getRawMany();

  //   const [lastMonthSales] = await this.checkoutRepository
  //     .createQueryBuilder('checkout')
  //     .select('COALESCE(SUM(checkout.total), 0)', 'sum')
  //     .where('checkout.createdAt >= :start AND checkout.createdAt < :end', {
  //       start: lastMonthStart,
  //       end: lastMonthEnd,
  //     })
  //     .getRawMany();

  //   const [allTimeSales] = await this.checkoutRepository
  //     .createQueryBuilder('checkout')
  //     .select('COALESCE(SUM(checkout.total), 0)', 'sum')
  //     .getRawMany();

  //   // Get order counts
  //   const totalOrders = await this.checkoutRepository.count();
  //   const ordersPending = await this.checkoutRepository.count({
  //     where: { status: { id: 1 } },
  //   });
  //   const ordersProcessing = await this.checkoutRepository.count({
  //     where: { status: { id: 2 } },
  //   });
  //   const ordersDelivered = await this.checkoutRepository.count({
  //     where: { status: { id: 3 } },
  //   });

  //   // Calculate top 3 products
  //   const date3MonthsAgo = new Date(now);
  //   date3MonthsAgo.setMonth(date3MonthsAgo.getMonth() - 3);

  //   const top3Raw = await this.checkoutItemRepository
  //     .createQueryBuilder('item')
  //     .leftJoin('item.checkout', 'checkout')
  //     .select(`item."productSnapshot"->>'id'`, 'productId')
  //     .addSelect(`item."productSnapshot"->>'name'`, 'productName')
  //     .addSelect(`item."productSnapshot"->>'sku'`, 'productSku')
  //     .addSelect(`item."productSnapshot"->>'image'`, 'productImage')
  //     .addSelect('COALESCE(SUM(item.total), 0)', 'totalValue')
  //     .addSelect('COALESCE(SUM(item.quantity), 0)', 'totalQuantity') // Add quantity count
  //     .where('checkout.createdAt >= :date3MonthsAgo', {
  //       date3MonthsAgo: new Date(
  //         new Date().setMonth(new Date().getMonth() - 3),
  //       ),
  //     })
  //     .groupBy(`item."productSnapshot"->>'id'`)
  //     .addGroupBy(`item."productSnapshot"->>'name'`)
  //     .addGroupBy(`item."productSnapshot"->>'sku'`)
  //     .addGroupBy(`item."productSnapshot"->>'image'`)
  //     .orderBy('SUM(item.total)', 'DESC')
  //     .limit(3)
  //     .getRawMany();

  //   const sumTop3 = top3Raw.reduce(
  //     (acc, curr) => acc + Number(curr.totalValue),
  //     0,
  //   );

  //   const top3ProductsLast3Months = top3Raw.map((product) => ({
  //     productSnapshot: {
  //       id: product.productId,
  //       name: product.productName,
  //       sku: product.productSku,
  //       image: product.productImage,
  //     },
  //     totalValue: Number(product.totalValue),
  //     totalQuantity: Number(product.totalQuantity), // Add to return object
  //     ratio: sumTop3
  //       ? Number(((Number(product.totalValue) / sumTop3) * 100).toFixed(2))
  //       : 0,
  //   }));

  //   return {
  //     todaySales: Number(todaySales?.sum) || 0,
  //     yesterdaySales: Number(yesterdaySales?.sum) || 0,
  //     thisMonthSales: Number(thisMonthSales?.sum) || 0,
  //     lastMonthSales: Number(lastMonthSales?.sum) || 0,
  //     allTimeSales: Number(allTimeSales?.sum) || 0,
  //     totalOrders,
  //     ordersPending,
  //     ordersProcessing,
  //     ordersDelivered,
  //     top3ProductsLast3Months,
  //   };
  // }

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Raw queries for totals
    const todaySalesQuery = `
    SELECT COALESCE(SUM("total"), 0) AS "sum"
    FROM "checkouts"
    WHERE "createdAt" >= $1
  `;
    const [todaySales] = await this.checkoutRepository.query(todaySalesQuery, [
      todayStart,
    ]);

    const yesterdaySalesQuery = `
    SELECT COALESCE(SUM("total"), 0) AS "sum"
    FROM "checkouts"
    WHERE "createdAt" >= $1
      AND "createdAt" < $2
  `;
    const [yesterdaySales] = await this.checkoutRepository.query(
      yesterdaySalesQuery,
      [yesterdayStart, todayStart],
    );

    const thisMonthSalesQuery = `
    SELECT COALESCE(SUM("total"), 0) AS "sum"
    FROM "checkouts"
    WHERE "createdAt" >= $1
  `;
    const [thisMonthSales] = await this.checkoutRepository.query(
      thisMonthSalesQuery,
      [monthStart],
    );

    const lastMonthSalesQuery = `
    SELECT COALESCE(SUM("total"), 0) AS "sum"
    FROM "checkouts"
    WHERE "createdAt" >= $1 
      AND "createdAt" < $2
  `;
    const [lastMonthSales] = await this.checkoutRepository.query(
      lastMonthSalesQuery,
      [lastMonthStart, lastMonthEnd],
    );

    const allTimeSalesQuery = `
    SELECT COALESCE(SUM("total"), 0) AS "sum"
    FROM "checkouts"
  `;
    const [allTimeSales] =
      await this.checkoutRepository.query(allTimeSalesQuery);

    // Get order counts
    const totalOrders = await this.checkoutRepository.count();
    const ordersCancelled = await this.checkoutRepository.count({
      where: { status: { id: 7 } },
    });
    const ordersProcessing = await this.checkoutRepository.count({
      where: { status: { id: 5 } },
    });
    const ordersDelivered = await this.checkoutRepository.count({
      where: { status: { id: 9 } },
    });

    // Top 3 products (3 months)
    const date3MonthsAgo = new Date();
    date3MonthsAgo.setMonth(date3MonthsAgo.getMonth() - 3);

    const top3Query = `
    SELECT 
      item."productSnapshot"->>'id'         AS "productId",
      item."productSnapshot"->>'name'       AS "productName",
      item."productSnapshot"->>'sku'        AS "productSku",
      item."productSnapshot"->>'image'      AS "productImage",
      COALESCE(SUM(item."total"), 0)        AS "totalValue",
      COALESCE(SUM(item."quantity"), 0)     AS "totalQuantity"
    FROM "checkout_items" AS item
    LEFT JOIN "checkouts" AS checkout ON item."checkout_id" = checkout."id"
    WHERE checkout."createdAt" >= $1
    GROUP BY
      item."productSnapshot"->>'id',
      item."productSnapshot"->>'name',
      item."productSnapshot"->>'sku',
      item."productSnapshot"->>'image'
    ORDER BY SUM(item."total") DESC
    LIMIT 3
  `;
    const top3Raw = await this.checkoutItemRepository.query(top3Query, [
      date3MonthsAgo,
    ]);

    const sumTop3 = top3Raw.reduce(
      (acc, curr) => acc + Number(curr.totalValue),
      0,
    );
    const top3ProductsLast3Months = top3Raw.map((product) => ({
      productSnapshot: {
        id: product.productId,
        name: product.productName,
        sku: product.productSku,
        image: product.productImage,
      },
      totalValue: Number(product.totalValue),
      totalQuantity: Number(product.totalQuantity),
      ratio: sumTop3
        ? Number(((Number(product.totalValue) / sumTop3) * 100).toFixed(2))
        : 0,
    }));

    return {
      todaySales: Number(todaySales?.sum) || 0,
      yesterdaySales: Number(yesterdaySales?.sum) || 0,
      thisMonthSales: Number(thisMonthSales?.sum) || 0,
      lastMonthSales: Number(lastMonthSales?.sum) || 0,
      allTimeSales: Number(allTimeSales?.sum) || 0,
      totalOrders,
      ordersCancelled,
      ordersProcessing,
      ordersDelivered,
      top3ProductsLast3Months,
    };
  }

  async findByUser(userId: number, paginationOptions: IPaginationOptions) {
    return this.findManyWithPagination({
      filterOptions: { userId },
      paginationOptions,
    });
  }

  async findByUserForFrontend(
    userId: number,
    paginationOptions: IPaginationOptions,
  ) {
    const [data, count] = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.items', 'items')
      .leftJoinAndSelect('checkout.status', 'status')
      .leftJoinAndSelect('checkout.coupon', 'coupon')
      .where('checkout.user.id = :userId', { userId })
      .orderBy('checkout.createdAt', 'DESC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .select([
        'checkout.id',
        'checkout.orderNumber',
        'checkout.total',
        'checkout.discount',
        'checkout.shipping',
        'checkout.createdAt',
        'coupon.code',
        'items.id',
        'items.quantity',
        'items.price',
        'items.total',
        'items.productSnapshot',
        'status',
      ])
      .getManyAndCount();

    return { data, total: count };
  }

  async findById(id: number): Promise<NullableType<CheckoutEntity>> {
    return this.checkoutRepository.findOne({
      where: { id },
      relations: [
        'user',
        'items',
        'billingAddress',
        'shippingAddress',
        'shippingMethod',
        'coupon',
        'status',
      ],
    });
  }

  async updateStatus(
    id: number,
    statusId: number,
    lastStatusNote?: string,
    title?: string,
  ): Promise<void> {
    await this.historyRepo.save({
      checkout: { id },
      status: { id: statusId },
      note: lastStatusNote,
      title,
    });

    await this.checkoutRepository.update(
      { id },
      {
        status: { id: statusId },
        lastStatusNote,
        updatedAt: new Date(),
      },
    );
  }

  async updatePaymentStatus(
    id: number,
    paymentStatus: PaymentStatus,
    paymentDetails?: Record<string, any>,
  ): Promise<void> {
    const update: any = {
      paymentStatus,
      paymentDetails,
    };

    if (paymentStatus === PaymentStatus.PAID) {
      update.paidAt = new Date();
    } else if (paymentStatus === PaymentStatus.REFUNDED) {
      update.refundedAt = new Date();
    }

    await this.checkoutRepository.update({ id }, update);
  }

  async cancel(id: number, reason?: string): Promise<void> {
    await this.checkoutRepository.update(
      { id },
      {
        canceledAt: new Date(),
        status: { id: 5 }, // Cancelled status
        lastStatusNote: reason,
        updatedAt: new Date(),
      },
    );
  }

  async validateCouponAmount(
    checkoutId: number,
    couponId: number,
  ): Promise<{ total: number; discountedTotal: number }> {
    const checkout = await this.findById(checkoutId);
    if (!checkout) {
      throw new BadRequestException('Checkout not found');
    }

    const subtotal = checkout.items.reduce((sum, item) => sum + item.total, 0);
    const shipping = checkout.shippingMethod?.charge || 0;
    const baseTotal = subtotal + shipping;

    if (!couponId) {
      return { total: baseTotal, discountedTotal: baseTotal };
    }

    const coupon = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .relation(CheckoutEntity, 'coupon')
      .of(checkout)
      .loadOne();

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    await this.validateCoupon(coupon, checkout, checkout.user.id);

    let discount = 0;
    if (subtotal >= (coupon.minOrderAmount || 0)) {
      const baseDiscount =
        coupon.discountType === DiscountType.FIXED
          ? coupon.discountValue
          : (subtotal * coupon.discountValue) / 100;

      discount = coupon.maxDiscountAmount
        ? Math.min(baseDiscount, coupon.maxDiscountAmount)
        : baseDiscount;
    }

    const discountedTotal = baseTotal - discount;

    return {
      total: baseTotal,
      discountedTotal: Math.max(0, discountedTotal),
    };
  }

  async getStatusHistory(checkoutId: number) {
    return this.historyRepo.find({
      where: { checkout: { id: checkoutId } },
      relations: ['status'],
      order: { createdAt: 'DESC' },
    });
  }

  private async calculateTotals(checkoutId: number): Promise<void> {
    const checkout = await this.findById(checkoutId);

    // Calculate subtotal from items
    const subtotal = checkout.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
    const shipping = Number(checkout.shippingMethod?.charge || 0);

    // Calculate discount with coupon rules
    let discount = 0;
    if (checkout.coupon) {
      // Check minimum order amount
      if (
        !checkout.coupon.minOrderAmount ||
        subtotal >= checkout.coupon.minOrderAmount
      ) {
        // Calculate base discount
        const baseDiscount =
          checkout.coupon.discountType === DiscountType.FIXED
            ? checkout.coupon.discountValue
            : (subtotal * checkout.coupon.discountValue) / 100;

        // Apply maximum discount cap if exists
        discount = checkout.coupon.maxDiscountAmount
          ? Math.min(baseDiscount, checkout.coupon.maxDiscountAmount)
          : baseDiscount;
      }
    }

    // Calculate final total
    const total = Number(subtotal) + Number(shipping) - Number(discount);

    // Update checkout with new totals
    await this.checkoutRepository.update(
      { id: checkoutId },
      {
        subtotal,
        shipping,
        discount,
        tax: 0,
        total: Number(total),
        updatedAt: new Date(),
      },
    );
  }

  private async validateCoupon(
    coupon: CouponEntity,
    checkout: CheckoutEntity,
    userId: number,
  ): Promise<void> {
    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }
    // Check if coupon is active
    if (coupon.status.id !== 1) {
      throw new BadRequestException('Coupon is not active');
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Coupon is expired or not yet valid');
    }

    // Check usage limits
    if (coupon.maxUses !== -1 && coupon.usageCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit exceeded');
    }

    const subtotal = checkout.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Order minimum of ${coupon.minOrderAmount} not met`,
      );
    }

    // Check products/categories
    const validProducts = await this.validateCouponProducts(coupon, checkout);
    if (!validProducts) {
      throw new BadRequestException('Coupon not valid for these products');
    }

    // Check per-user limit
    const userUsageCount = await this.getUserCouponUsage(coupon.id, userId);
    if (userUsageCount >= coupon.maxUsesPerUser) {
      throw new BadRequestException('User coupon usage limit exceeded');
    }
  }

  private async validateCouponProducts(
    coupon: CouponEntity,
    checkout: CheckoutEntity,
  ): Promise<boolean> {
    if (!coupon.products?.length && !coupon.categories?.length) {
      return true;
    }

    for (const item of checkout.items) {
      const productValid = coupon.products.some(
        (p) => p.id === item.productSnapshot.id,
      );
      if (productValid) continue;

      const categoryValid = coupon.categories.some(
        (c) => c.id === item.productSnapshot.category,
      );
      if (categoryValid) continue;

      return false;
    }

    return true;
  }

  private async getUserCouponUsage(
    couponId: number,
    userId: number,
  ): Promise<number> {
    const usageCount = await this.checkoutRepository.count({
      where: {
        user: { id: userId },
        coupon: { id: couponId },
        paymentStatus: PaymentStatus.PAID, // Only count successful checkouts
      },
    });

    return usageCount;
  }
}
