import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/products'
import type { IProduct, IProductForm } from '../types/product'
import { PRODUCTS_KEY } from './useProducts'
import { notifications } from '@mantine/notifications'

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IProductForm) =>
      productsApi.create(data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      notifications.show({
        color: 'green',
        message: 'Mahsulot muvaffaqiyatli yaratildi',
      })
    },

    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Mahsulot yaratishda xatolik yuz berdi',
      })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IProductForm> }) =>
      productsApi.update(id, data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      notifications.show({
        color: 'green',
        message: 'Mahsulot muvaffaqiyatli yangilandi',
      })
    },

    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Mahsulot yangilashda xatolik yuz berdi',
      })
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const res = await productsApi.delete(id)
        return res.data
      } catch (error) {
        // API "EntityNotFoundError" — mahsulot allaqachon o'chirilgan
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 400 &&
          error.response.data?.name === 'EntityNotFoundError'
        ) {
          return true
        }
        throw error
      }
    },

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [PRODUCTS_KEY] })

      const previousQueries = queryClient.getQueriesData<IProduct[]>({
        queryKey: [PRODUCTS_KEY],
      })

      queryClient.setQueriesData<IProduct[]>(
        { queryKey: [PRODUCTS_KEY] },
        (old) => old?.filter((p) => p.id !== deletedId),
      )

      return { previousQueries }
    },

    onSuccess: () => {
      notifications.show({
        color: 'green',
        message: "Mahsulot muvaffaqiyatli o'chirildi",
      })
    },

    onError: (_err, _id, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      notifications.show({
        color: 'red',
        message: "O'chirishda xatolik yuz berdi",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
    },
  })
}

