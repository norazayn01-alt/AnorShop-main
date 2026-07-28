import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/products'
import type { ICategory, ICategoryForm } from '../types/product'
import { CATEGORIES_KEY } from './useProducts'
import { notifications } from '@mantine/notifications'

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ICategoryForm) =>
      categoriesApi.create(data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      notifications.show({
        color: 'green',
        message: 'Kategoriya muvaffaqiyatli yaratildi',
      })
    },

    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Kategoriya yaratishda xatolik yuz berdi',
      })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ICategoryForm> }) =>
      categoriesApi.update(id, data).then((res) => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      notifications.show({
        color: 'green',
        message: 'Kategoriya muvaffaqiyatli yangilandi',
      })
    },

    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Kategoriya yangilashda xatolik yuz berdi',
      })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        const res = await categoriesApi.delete(id)
        return res.data
      } catch (error) {
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
      await queryClient.cancelQueries({ queryKey: [CATEGORIES_KEY] })

      const previousData = queryClient.getQueryData<ICategory[]>([
        CATEGORIES_KEY,
      ])

      queryClient.setQueryData<ICategory[]>([CATEGORIES_KEY], (old) =>
        old?.filter((c) => c.id !== deletedId),
      )

      return { previousData }
    },

    onSuccess: () => {
      notifications.show({
        color: 'green',
        message: "Kategoriya muvaffaqiyatli o'chirildi",
      })
    },

    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([CATEGORIES_KEY], context.previousData)
      }
      notifications.show({
        color: 'red',
        message: "O'chirishda xatolik yuz berdi",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
    },
  })
}

