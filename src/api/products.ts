import type {
  ICategory,
  ICategoryForm,
  IProduct,
  IProductForm,
  TProductParams,
} from '../types/product'
import { $api } from './api'

export const productsApi = {
  get: (params?: TProductParams) =>
    $api.get<IProduct[]>('/products', { params }),

  getById: (id: number) => $api.get<IProduct>(`/products/${id}`),

  create: (data: IProductForm) => $api.post<IProduct>('/products', data),

  update: (id: number, data: Partial<IProductForm>) =>
    $api.put<IProduct>(`/products/${id}`, data),

  delete: (id: number) => $api.delete(`/products/${id}`),
}

export const categoriesApi = {
  get: () => $api.get<ICategory[]>('/categories'),

  getById: (id: number) => $api.get<ICategory>(`/categories/${id}`),

  create: (data: ICategoryForm) => $api.post<ICategory>('/categories', data),

  update: (id: number, data: Partial<ICategoryForm>) =>
    $api.put<ICategory>(`/categories/${id}`, data),

  delete: (id: number) => $api.delete(`/categories/${id}`),
}
