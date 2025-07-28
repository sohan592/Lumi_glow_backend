import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonArrayPipe implements PipeTransform {
  transform(value: any) {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (error) {
      throw new BadRequestException('Invalid JSON string array');
    }
  }
}
