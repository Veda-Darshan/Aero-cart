// Shared types for src components

export interface ProductVariant {
  name: string;
  stock: { [vendorId: number]: number };
}

export interface Product {
  id: number;
  name: string;
  weight: string;
  price: number;
  stock: { [vendorId: number]: number };
  variants?: ProductVariant[];
  category: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Rider {
  id: string;
  name: string;
  vehicle: string;
  coords: [number, number];
  status: "Idle" | "Delivering";
  earnings: number;
  deliveriesCount: number;
}

export interface Order {
  id: string;
  vendorId: number;
  vendorName: string;
  vendorAddress: string;
  items: CartItem[];
  total: number;
  status: "Pending" | "Accepted" | "Dispatched" | "Delivered";
  paymentMethod: "Online" | "COD";
  deliveryArea: string;
  assignedRider?: Rider;
}

export interface Feedback {
  id: string;
  orderId?: string;
  category: string;
  content: string;
  timestamp: string;
}

export interface Vendor {
  id: number;
  name: string;
  address: string;
  coords: [number, number];
}
