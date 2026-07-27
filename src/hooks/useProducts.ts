import { useQuery } from '@tanstack/react-query'
import { categoriesApi, productsApi } from '../api/products'
import type { TProductParams } from '../types/product'

export const PRODUCTS_KEY = 'products'
export const CATEGORIES_KEY = 'categories'

export const useProducts = (params?: TProductParams) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params ?? {}],
    queryFn: () => productsApi.get(params).then((resp) => resp.data),
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => categoriesApi.get().then((resp) => resp.data),
  })
}
