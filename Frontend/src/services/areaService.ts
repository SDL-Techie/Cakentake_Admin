import { api } from "./api";

/* ============================
   Types
============================ */

export interface Area {
  id: number;
  name: string;
  delivery_charge: number;
  min_order_value: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAreaPayload {
  name: string;
  delivery_charge?: number;
  min_order_value?: number;
  is_active?: boolean;
}

export interface CheckDeliveryPayload {
  area_id: number;
  order_amount: number;
}

export interface CheckDeliveryResponse {
  success: boolean;
  delivery_available: boolean;
  message: string;
  area: Area;
  delivery_charge: number;
  min_order_value: number;
}

/* ============================
   Areas
============================ */

export const getAreas = async (): Promise<Area[]> => {
  const res = await axios.get("/areas");
  return res.data.areas;
};

export const getArea = async (id: number): Promise<Area> => {
  const res = await axios.get(`/areas/${id}`);
  return res.data.area;
};

export const createArea = async (
  payload: CreateAreaPayload
): Promise<any> => {
  const res = await axios.post("/areas", payload);
  return res.data;
};

export const updateArea = async (
  id: number,
  payload: Partial<CreateAreaPayload>
): Promise<any> => {
  const res = await axios.put(`/areas/${id}`, payload);
  return res.data;
};

export const deleteArea = async (id: number): Promise<any> => {
  const res = await axios.delete(`/areas/${id}`);
  return res.data;
};

/* ============================
   Delivery Charge
============================ */

export const setAreaCharge = async (
  areaId: number,
  delivery_charge: number
): Promise<any> => {
  const res = await axios.post(`/areas/${areaId}/set-charge`, {
    delivery_charge,
  });

  return res.data;
};

/* ============================
   Minimum Order
============================ */

export const setAreaMinOrder = async (
  areaId: number,
  min_order_value: number
): Promise<any> => {
  const res = await axios.post(`/areas/${areaId}/set-min-order`, {
    min_order_value,
  });

  return res.data;
};

/* ============================
   Orders
============================ */

export const getAreaOrders = async (
  areaId: number
): Promise<any> => {
  const res = await axios.get(`/areas/${areaId}/orders`);
  return res.data.orders;
};

/* ============================
   Check Delivery
============================ */

export const checkDelivery = async (
  payload: CheckDeliveryPayload
): Promise<CheckDeliveryResponse> => {
  const res = await axios.post("/areas/check-delivery", payload);
  return res.data;
};