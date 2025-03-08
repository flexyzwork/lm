import 'zod-openapi/extend';
import { createSchema } from 'zod-openapi';
import { userSchemas } from '../schemas';

export const openApiSchemas = {
  CreateUser: createSchema(userSchemas.Insert.openapi({ title: 'CreateUser' })),
  UpdateUser: createSchema(userSchemas.Update.openapi({ title: 'UpdateUser' })),
  UserResponse: createSchema(userSchemas.Select.openapi({ title: 'UserResponse' })),
};
