/**
 * CosmoPOS Type Definitions
 */

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  CASHIER = 'cashier',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  CCP = 'ccp',
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency: string;
  taxRate: number;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  storeId: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  storeId: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  categoryId: string;
  brand?: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  expiryDate?: number;
  imageUrl?: string;
  description?: string;
  storeId: string;
  updatedAt: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Selling price at time of sale
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  cashierId: string;
  storeId: string;
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  isVip: boolean;
  storeId: string;
  createdAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  storeId: string;
}
