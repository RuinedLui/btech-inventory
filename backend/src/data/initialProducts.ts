import { Product } from '../types/inventory.types.js';

export const INITIAL_PRODUCTS: Product[] = [
  {
    code: 'CAM-01',
    description: 'Cámara IP',
    quantity: 2,
    price: 125.0,
  },
  {
    code: 'SW-01',
    description: 'Switch',
    quantity: 1,
    price: 180.0,
  },
  {
    code: 'UPS-01',
    description: 'UPS',
    quantity: 1,
    price: 250.0,
  },
  {
    code: 'CAB-01',
    description: 'Cable',
    quantity: 5,
    price: 15.0,
  },
  {
    code: 'CON-01',
    description: 'Conector',
    quantity: 10,
    price: 5.0,
  },
];
