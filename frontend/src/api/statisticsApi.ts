import { apiClient } from "./http";

// ===============================
// TYPES
// ===============================

export type OrdersByStatus = {
  [key: string]: {
    count: number;
    revenue: number;
  };
};

export type PaymentMethodStats = {
  [key: string]: {
    count: number;
    revenue: number;
  };
};

export type OverviewResponse = {
  success: boolean;
  data: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    ordersByStatus: OrdersByStatus;
    paymentMethods: PaymentMethodStats;
  };
};

export type RevenueByTimeItem = {
  _id: {
    year: number;
    month?: number;
    day?: number;
    hour?: number;
    week?: number;
  };
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
};

export type RevenueByTimeResponse = {
  success: boolean;
  data: RevenueByTimeItem[];
};

export type TopProduct = {
  _id: string;
  productName: string;
  productImage: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
};

export type TopProductsResponse = {
  success: boolean;
  data: TopProduct[];
};

export type TopCustomer = {
  _id: string;
  orderCount: number;
  totalSpent: number;
  avgOrderValue: number;
  userName: string;
  userEmail: string;
};

export type CustomerStatsResponse = {
  success: boolean;
  data: {
    totalCustomers: number;
    topCustomersByOrders: TopCustomer[];
    topCustomersByRevenue: TopCustomer[];
  };
};

export type RecentOrder = {
  _id: string;
  status: string;
  paymentMethod: string;
  totals: {
    subtotal: number;
    total: number;
  };
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
};

export type RecentOrdersResponse = {
  success: boolean;
  data: RecentOrder[];
};

export type ComparisonResponse = {
  success: boolean;
  data: {
    current: {
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
    };
    previous: {
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
    };
    changes: {
      ordersChange: number;
      revenueChange: number;
      avgOrderValueChange: number;
    };
  };
};

// ===============================
// API FUNCTIONS
// ===============================

export async function getOrderOverview(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<OverviewResponse> {
  const { data } = await apiClient.get<OverviewResponse>(
    "/statistics/overview",
    { params }
  );
  return data;
}

export async function getRevenueByTime(params?: {
  period?: "hour" | "day" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
}): Promise<RevenueByTimeResponse> {
  const { data } = await apiClient.get<RevenueByTimeResponse>(
    "/statistics/revenue-by-time",
    { params }
  );
  return data;
}

export async function getTopProducts(params?: {
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<TopProductsResponse> {
  const { data } = await apiClient.get<TopProductsResponse>(
    "/statistics/top-products",
    { params }
  );
  return data;
}

export async function getCustomerStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CustomerStatsResponse> {
  const { data } = await apiClient.get<CustomerStatsResponse>(
    "/statistics/customer-stats",
    { params }
  );
  return data;
}

export async function getRecentOrders(params?: {
  limit?: number;
}): Promise<RecentOrdersResponse> {
  const { data } = await apiClient.get<RecentOrdersResponse>(
    "/statistics/recent-orders",
    { params }
  );
  return data;
}

export async function getComparison(params: {
  currentStart: string;
  currentEnd: string;
  previousStart: string;
  previousEnd: string;
}): Promise<ComparisonResponse> {
  const { data } = await apiClient.get<ComparisonResponse>(
    "/statistics/comparison",
    { params }
  );
  return data;
}

// ===============================
// INVENTORY TYPES
// ===============================

export type InventoryProduct = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
};

export type InventoryByCategory = {
  [category: string]: {
    count: number;
    totalQuantity: number;
    totalValue: number;
  };
};

export type InventoryResponse = {
  success: boolean;
  data: {
    summary: {
      totalProducts: number;
      totalInventoryValue: number;
      outOfStockCount: number;
      lowStockCount: number;
      inStockCount: number;
    };
    outOfStock: InventoryProduct[];
    lowStock: InventoryProduct[];
    byCategory: InventoryByCategory;
    allProducts: InventoryProduct[];
  };
};

export async function getInventory(params?: {
  lowStockThreshold?: number;
}): Promise<InventoryResponse> {
  const { data } = await apiClient.get<InventoryResponse>(
    "/statistics/inventory",
    { params }
  );
  return data;
}
