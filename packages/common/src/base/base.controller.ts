import { Controller } from '@nestjs/common';
import { API } from '..';
/**
 * 📌 모든 컨트롤러의 공통 베이스 컨트롤러
 */
@Controller()
export class BaseController {
  constructor() {
    this.applyAPIDecorators();
  }

  /**
   * 📌 모든 메소드에 `@API()` 데코레이터 자동 적용 (단, `autoComplete: false`면 제외)
   */
  public applyAPIDecorators() {
    const prototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(prototype).filter(
      (method) => method !== 'constructor' && typeof prototype[method] === 'function'
    );

    methods.forEach((method) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
      if (!descriptor) return;

      // ✅ 기존 `@API()` 데코레이터가 적용된 경우 확인
      const existingAPIOptions = Reflect.getMetadata('API_OPTIONS', prototype, method);

      // ✅ 기존에 `autoComplete: false`가 설정된 경우 자동 적용 방지
      if (existingAPIOptions?.autoComplete === false) {
        console.log(`⚠️ [BaseController] @API() 자동 적용 제외 → ${method} (autoComplete: false)`);
        return;
      }

      // ✅ 기존에 적용되지 않았다면 자동 적용
      if (!existingAPIOptions) {
        API()(prototype, method, descriptor);
        console.log(`✅ [BaseController] @API() 자동 적용 완료 → ${method}`);
      }
    });
  }
}
