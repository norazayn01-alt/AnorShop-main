import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useDebouncedValue } from '@mantine/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from '@mantine/form'
import {
  Card,
  Stack,
  Group,
  Title,
  Text,
  Button,
  TextInput,
  Select,
  ActionIcon,
  Table,
  Avatar,
  Badge,
  Tooltip,
  Pagination,
  Modal,
  NumberInput,
  Textarea,
  Center,
  Skeleton,
  Alert,
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconPencil,
  IconTrash,
  IconPackage,
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
} from '@tabler/icons-react'

import {
  useProducts,
  useCategories,
  PRODUCTS_KEY,
} from '../../hooks/useProducts'
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProductMutation'
import { productsApi } from '../../api/products'
import type { IProduct, IProductForm } from '../../types/product'

export const AdminProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // URL Params
  const searchParam = searchParams.get('search') || ''
  const categoryParam = searchParams.get('categoryId') || ''
  const pageParam = Number(searchParams.get('page')) || 1
  const sortParam = searchParams.get('sort') || ''

  // Local state for search input
  const [searchValue, setSearchValue] = useState(searchParam)
  const [debouncedSearch] = useDebouncedValue(searchValue, 500)

  // Sync debounced search to URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev)
        if (debouncedSearch) {
          newParams.set('search', debouncedSearch)
        } else {
          newParams.delete('search')
        }
        if (
          prev.get('search') !== debouncedSearch &&
          prev.get('search') !== null &&
          debouncedSearch !== ''
        ) {
          newParams.set('page', '1')
        } else if (debouncedSearch === '' && prev.get('search')) {
          newParams.set('page', '1')
        }
        return newParams
      },
      { replace: true }
    )
  }, [debouncedSearch, setSearchParams])

  const handleCategoryChange = (value: string | null) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (value) newParams.set('categoryId', value)
      else newParams.delete('categoryId')
      newParams.set('page', '1')
      return newParams
    })
  }

  const handleSortChange = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      const currentSort = prev.get('sort')
      if (!currentSort) newParams.set('sort', 'price_asc')
      else if (currentSort === 'price_asc') newParams.set('sort', 'price_desc')
      else newParams.delete('sort')
      newParams.set('page', '1')
      return newParams
    })
  }

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', page.toString())
      return newParams
    })
  }

  // Queries
  const {
    data: productsData,
    isLoading,
    isError,
  } = useProducts({
    title: debouncedSearch || undefined,
    categoryId: categoryParam ? Number(categoryParam) : undefined,
  })

  const { data: categoriesData } = useCategories()
  const categoryOptions =
    categoriesData?.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    })) || []

  // Mutations
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  // Modals state
  const [modalOpened, setModalOpened] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null)

  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<IProduct | null>(null)

  // Form
  const form = useForm<IProductForm>({
    initialValues: {
      title: '',
      price: 0,
      description: '',
      categoryId: 0,
      images: [''],
    },
    validate: {
      title: (value) =>
        value.length < 2 ? 'Title must have at least 2 characters' : null,
      price: (value) => (value <= 0 ? 'Price must be greater than 0' : null),
      categoryId: (value) => (value === 0 ? 'Select a category' : null),
      images: (value) =>
        !value[0] || value[0].trim() === '' ? 'Image URL is required' : null,
    },
  })

  const openCreateModal = () => {
    setModalMode('create')
    setEditingProduct(null)
    form.reset()
    setModalOpened(true)
  }

  const openEditModal = (product: IProduct) => {
    setModalMode('edit')
    setEditingProduct(product)
    form.setValues({
      title: product.title,
      price: product.price,
      description: product.description,
      categoryId: product.category.id,
      images: product.images?.length ? [product.images[0]] : [''],
    })
    setModalOpened(true)
  }

  const handleFormSubmit = (values: IProductForm) => {
    if (modalMode === 'create') {
      createMutation.mutate(values, {
        onSuccess: () => {
          setModalOpened(false)
          form.reset()
        },
      })
    } else if (modalMode === 'edit' && editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, data: values },
        {
          onSuccess: () => {
            setModalOpened(false)
            form.reset()
          },
        }
      )
    }
  }

  const handleDeleteClick = (product: IProduct) => {
    setDeletingProduct(product)
    setDeleteModalOpened(true)
  }

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id, {
        onSettled: () => {
          setDeleteModalOpened(false)
          setDeletingProduct(null)
        },
      })
    }
  }

  // Client-side sort and pagination
  const sortedProducts = useMemo(() => {
    const copy = [...(productsData || [])]
    if (sortParam === 'price_asc') {
      copy.sort((a, b) => a.price - b.price)
    } else if (sortParam === 'price_desc') {
      copy.sort((a, b) => b.price - a.price)
    }
    return copy
  }, [productsData, sortParam])

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (pageParam - 1) * itemsPerPage,
    pageParam * itemsPerPage
  )

  // Render sorting icon
  const SortIcon =
    sortParam === 'price_asc'
      ? IconSortAscending
      : sortParam === 'price_desc'
        ? IconSortDescending
        : IconArrowsSort

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Products Management</Title>
          <Text c="dimmed" size="sm">
            Manage your store products, pricing, and categories
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          color="anor"
          onClick={openCreateModal}
        >
          Create Product
        </Button>
      </Group>

      <Card withBorder>
        <Stack gap="md">
          {/* Filters Bar */}
          <Group grow>
            <TextInput
              placeholder="Search products..."
              leftSection={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
            />
            <Select
              placeholder="All categories"
              data={categoryOptions}
              value={categoryParam ? String(categoryParam) : null}
              onChange={handleCategoryChange}
              clearable
            />
            <div>
              <Tooltip
                label={
                  sortParam === 'price_asc'
                    ? 'Price: Low to High'
                    : sortParam === 'price_desc'
                      ? 'Price: High to Low'
                      : 'No sorting'
                }
              >
                <ActionIcon
                  size="input-sm"
                  variant="default"
                  onClick={handleSortChange}
                >
                  <SortIcon size={18} />
                </ActionIcon>
              </Tooltip>
            </div>
          </Group>

          {/* Table / States */}
          {isLoading ? (
            <Stack>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={50} />
              ))}
            </Stack>
          ) : isError ? (
            <Alert color="red" title="Xatolik">
              Mahsulotlarni yuklashda xatolik yuz berdi
            </Alert>
          ) : paginatedProducts.length === 0 ? (
            <Center py="xl">
              <Stack align="center">
                <IconPackage size={48} color="gray" />
                <Text c="dimmed">Mahsulotlar topilmadi</Text>
              </Stack>
            </Center>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Image</Table.Th>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedProducts.map((product) => (
                    <Table.Tr
                      key={product.id}
                      onMouseEnter={() => {
                        queryClient.prefetchQuery({
                          queryKey: [PRODUCTS_KEY, 'detail', product.id],
                          queryFn: () =>
                            productsApi.getById(product.id).then((r) => r.data),
                          staleTime: 60_000,
                        })
                      }}
                    >
                      <Table.Td>
                        <Avatar src={product.images?.[0]} radius="sm" />
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>{product.title}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="anor" variant="light">
                          {product.category?.name}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text>${product.price}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <Tooltip label="Edit">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => openEditModal(product)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Stack>
      </Card>

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={pageParam}
            onChange={handlePageChange}
            color="anor"
          />
        </Group>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={modalMode === 'create' ? 'Create Product' : 'Edit Product'}
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="Product title"
              {...form.getInputProps('title')}
            />
            <NumberInput
              label="Price ($)"
              min={0}
              {...form.getInputProps('price')}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={categoryOptions}
              value={
                form.values.categoryId ? String(form.values.categoryId) : null
              }
              onChange={(val) => form.setFieldValue('categoryId', Number(val))}
              error={form.errors.categoryId}
            />
            <TextInput
              label="Image URL"
              placeholder="https://..."
              value={form.values.images[0] || ''}
              onChange={(e) =>
                form.setFieldValue('images', [e.currentTarget.value])
              }
              error={form.errors.images}
            />
            <Textarea
              label="Description"
              placeholder="Product description..."
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="anor"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {modalMode === 'create' ? 'Create' : 'Save'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <Text size="sm" mb="lg">
          Rostdan ham bu mahsulotni o'chirmoqchimisiz?
          {deletingProduct && (
            <Text fw={500} mt="xs">
              {deletingProduct.title}
            </Text>
          )}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={confirmDelete}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
