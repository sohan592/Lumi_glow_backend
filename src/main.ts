import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import { AllConfigType } from './config/config.type';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as swaggerUi from 'swagger-ui-dist';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  // Enable DI support for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService<AllConfigType>);

  const port =
    configService.getOrThrow('app.port', {
      infer: true,
    }) || 3000;
  const apiPrefix =
    configService.getOrThrow('app.apiPrefix', {
      infer: true,
    }) || '/api';

  // Shutdown hooks for cleanup tasks
  app.enableShutdownHooks();

  // Global configurations
  app.setGlobalPrefix(apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`, {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // Resolve Promises for ClassSerializer
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Swagger API Documentation setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fusion Pro API')
    .setDescription('API documentation for Fusion Pro')
    .setVersion('1.0')
    .addBearerAuth()
    .setContact('M4yours IT', 'https://www.m4yours.com/', 'info@m4yours.com')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customJs: swaggerUi.getAbsoluteFSPath() + '/swagger-ui-bundle.js',
    customCssUrl: swaggerUi.getAbsoluteFSPath() + '/swagger-ui.css',
  });
  SwaggerModule.setup('docs', app, document);

  // Start the server
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger API documentation is available at: ${await app.getUrl()}/docs`,
  );
}
void bootstrap();
