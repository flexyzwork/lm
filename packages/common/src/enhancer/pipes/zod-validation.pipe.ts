/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {

    // ✅ `body` 데이터만 검증하고, `param`, `query` 등은 검증하지 않음
    if (metadata.type !== 'body' || !this.schema) {
      return value;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: '업데이트할 데이터가 없습니다.',
      });
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      throw error;
    }
  }
}