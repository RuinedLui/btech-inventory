import { CreateProductDTO, ValidationResult } from '../types/inventory.types.js';

export class InventoryValidator {
  static validate(
    dto: Partial<CreateProductDTO> | unknown,
    isCodeTaken: (code: string) => boolean
  ): ValidationResult {
    const data = dto && typeof dto === 'object' && !Array.isArray(dto)
      ? dto as Partial<CreateProductDTO>
      : {};
    const errors: Record<string, string> = {};

    if (typeof data.code !== 'string' || !data.code.trim()) {
      errors.code = 'El código es obligatorio.';
    } else if (isCodeTaken(data.code.trim().toUpperCase())) {
      errors.code = `El código '${data.code.trim().toUpperCase()}' ya se encuentra registrado.`;
    }

    if (typeof data.description !== 'string' || !data.description.trim()) {
      errors.description = 'La descripción es obligatoria.';
    }

    let quantity: number | undefined;
    const rawQuantity = data.quantity;
    if (rawQuantity === undefined || rawQuantity === null || rawQuantity === '') {
      errors.quantity = 'La cantidad es obligatoria.';
    } else if ((typeof rawQuantity !== 'number' && typeof rawQuantity !== 'string') ||
      (typeof rawQuantity === 'string' && !/^\d+$/.test(rawQuantity.trim()))) {
      errors.quantity = 'La cantidad debe ser un número entero positivo.';
    } else {
      const value = Number(rawQuantity);
      if (!Number.isSafeInteger(value) || value <= 0) {
        errors.quantity = 'La cantidad debe ser un número entero positivo.';
      } else {
        quantity = value;
      }
    }

    let price: number | undefined;
    const rawPrice = data.price;
    if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
      errors.price = 'El precio unitario es obligatorio.';
    } else if ((typeof rawPrice !== 'number' && typeof rawPrice !== 'string') ||
      (typeof rawPrice === 'string' && !/^\d+(\.\d+)?$/.test(rawPrice.trim()))) {
      errors.price = 'El precio unitario debe ser un valor numérico positivo.';
    } else {
      const value = Number(rawPrice);
      const decimals = String(rawPrice).split('.')[1];
      const cents = Math.round(value * 100);
      if (!Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(cents)) {
        errors.price = 'El precio unitario debe ser un número positivo válido.';
      } else if (decimals && decimals.length > 2) {
        errors.price = 'El precio no puede tener más de dos decimales.';
      } else {
        price = cents / 100;
      }
    }

    const isValid = Object.keys(errors).length === 0;
    return {
      isValid,
      errors,
      sanitizedData: isValid ? {
        code: (data.code as string).trim().toUpperCase(),
        description: (data.description as string).trim(),
        quantity: quantity as number,
        price: price as number,
      } : undefined,
    };
  }
}
