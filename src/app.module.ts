import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';

import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './database/config/database.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { AttributeModule } from './modules/attributes/attribute.module';
import { AuthModule } from './modules/auth/auth.module';
import authConfig from './modules/auth/config/auth.config';
import { BrandModule } from './modules/brands/brand.module';
import { CategoryModule } from './modules/categories/category.module';
import fileConfig from './modules/files/config/file.config';
import { FilesModule } from './modules/files/files.module';
import mailConfig from './modules/mail/config/mail.config';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { MediaModule } from './modules/media/media.modules';
import { ProductModule } from './modules/products/product.module';
import { SessionModule } from './modules/session/session.module';
import { TagModule } from './modules/tags/tag.module';
import { UsersModule } from './modules/users/users.module';
import { CartModule } from './modules/cart/cart.module';
import { AddressModule } from './modules/address/address.module';
import { CouponModule } from './modules/coupons/coupon.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { ReviewModule } from './modules/review/review.module';
import { ContactModule } from './modules/contactUs/contact.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { FaceAnalysisModule } from './modules/face-analysis/face-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, fileConfig, authConfig, mailConfig],
      envFilePath: path.resolve(__dirname, '../.env'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    SessionModule,
    MailModule,
    MailerModule,
    CategoryModule,
    AttributeModule,
    TagModule,
    BrandModule,
    ProductModule,
    MediaModule,
    CartModule,
    AddressModule,
    CouponModule,
    ShippingModule,
    ReviewModule,
    ContactModule,
    CheckoutModule,
    FaceAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
