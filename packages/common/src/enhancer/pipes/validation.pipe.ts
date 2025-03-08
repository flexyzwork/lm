import {
  BadRequestException,
  ValidationPipe as NestValidationPipe,
  PipeTransform,
} from '@nestjs/common';

export class ValidationPipe implements PipeTransform<any> {
  private readonly validationPipe: NestValidationPipe;

  constructor() {
    this.validationPipe = new NestValidationPipe({
      validateCustomDecorators: true,
      transform: true,
      exceptionFactory: (errors) => {
        const error = errors.map((e) => ({
          [e.property]: e.constraints,
        }));
        return new BadRequestException(error);
      },
    });
  }

  transform(value: any, metadata?: any) {
    return this.validationPipe.transform(value, metadata);
  }
}
