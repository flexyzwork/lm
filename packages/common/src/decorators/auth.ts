import {
  applyDecorators,
  // SetMetadata,
  UseGuards,
} from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards';
// import { JwtAuthGuard } from '../../guards';
// import { RolesGuard } from '../guard/role.quard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

export function Auth(/* ...role: string[] */) {
  return applyDecorators(
    // SetMetadata('role', role),
    UseGuards(JwtAuthGuard /*, RolesGuard */),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
