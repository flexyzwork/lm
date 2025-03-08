import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { openApiSchemas } from './openapi.schemas';

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('NestJS API with Zod and OpenAPI')
    .setVersion('1.0.0')
    .addBearerAuth() // ✅ Swagger UI에서 JWT 인증 추가
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // ✅ components가 없을 경우 초기화
  document.components = document.components || {};
  document.components.schemas = document.components.schemas || {};

  // ✅ Zod 변환된 OpenAPI 스키마 적용
  Object.assign(document.components.schemas, openApiSchemas as Record<string, unknown>);

  // ✅ Swagger UI 적용
  SwaggerModule.setup('swagger', app, document);
}
