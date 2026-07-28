import { api } from './api';

export const menuManagementService = {
  getProducts: (categoryId?: string) =>
    categoryId && categoryId !== 'all'
      ? axios.get(`/products/category/${categoryId}`)
      : axios.get('/products?admin=true'),
  getCategories: () => axios.get('/category'),
  getSubcategories: () => axios.get('/subcategories'),
  getVariants: () => axios.get('/variants'),
  getFlavors: (variantId: string | number) => axios.get(`/flavors/${variantId}`),
  getAddons: () => axios.get('/addons'),
  getCombos: () => axios.get('/combos'),
  getPromoCodes: () => axios.get('/promos'),

  createProduct: (payload: unknown) => axios.post('/products', payload),
  updateProduct: (id: string | number, payload: unknown) => axios.put(`/products/${id}`, payload),
  deleteProduct: (id: string | number) => axios.delete(`/products/${id}`),

  createCategory: (payload: unknown) => axios.post('/category', payload),
  updateCategory: (id: string | number, payload: unknown) => axios.put(`/category/${id}`, payload),
  deleteCategory: (id: string | number) => axios.delete(`/category/${id}`),

  createSubcategory: (payload: unknown) => axios.post('/subcategories', payload),
  updateSubcategory: (id: string | number, payload: unknown) => axios.put(`/subcategories/${id}`, payload),
  deleteSubcategory: (id: string | number) => axios.delete(`/subcategories/${id}`),

  createVariant: (payload: unknown) => axios.post('/variants', payload),
  updateVariant: (id: string | number, payload: unknown) => axios.put(`/variants/${id}`, payload),
  deleteVariant: (id: string | number) => axios.delete(`/variants/${id}`),

  createFlavor: (payload: unknown) => axios.post('/flavors', payload),
  updateFlavor: (id: string | number, payload: unknown) => axios.put(`/flavors/${id}`, payload),
  deleteFlavor: (id: string | number) => axios.delete(`/flavors/${id}`),

  createAddon: (payload: unknown) => axios.post('/addons', payload),
  updateAddon: (id: string | number, payload: unknown) => axios.put(`/addons/${id}`, payload),
  deleteAddon: (id: string | number) => axios.delete(`/addons/${id}`),

  createCombo: (payload: unknown) => axios.post('/combos', payload),
  updateCombo: (id: string | number, payload: unknown) => axios.put(`/combos/${id}`, payload),
  deleteCombo: (id: string | number) => axios.delete(`/combos/${id}`),

  createPromoCode: (payload: unknown) => axios.post('/promos', payload),
  updatePromoCode: (id: string | number, payload: unknown) => axios.put(`/promos/${id}`, payload),
  deletePromoCode: (id: string | number) => axios.delete(`/promos/${id}`),
};
