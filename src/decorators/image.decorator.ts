import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import { MediaEntity } from '@src/modules/media/entity/file.entity';

export function IsImageMediaType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isImageMediaType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: MediaEntity[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          return value.every((media) => media?.mimeType?.startsWith('image/'));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must contain only image files`;
        },
      },
    });
  };
}
