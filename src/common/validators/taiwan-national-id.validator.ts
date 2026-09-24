import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { isIdCardNumber } from 'taiwan-id-validator';

export function IsTaiwanNationalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTaiwanNationalId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isIdCardNumber(value);
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not a valid Taiwan national ID`;
        },
      },
    });
  };
}
