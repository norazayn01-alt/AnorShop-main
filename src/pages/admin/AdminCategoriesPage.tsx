import { useState } from 'react'
import {
  Card,
  Table,
  Group,
  Text,
  ActionIcon,
  Button,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  Center,
  Title,
  Modal,
  TextInput,
  Tooltip,
  Box,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCategory,
} from '@tabler/icons-react'

import { useCategories } from '../../hooks/useProducts'
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategoryMutation'
import type { ICategory, ICategoryForm } from '../../types/product'

export const AdminCategoriesPage = () => {
  const { data: categories, isLoading, isError } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null)
  const [modalOpened, setModalOpened] = useState(false)

  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null
  )

  const form = useForm<ICategoryForm>({
    initialValues: {
      name: '',
      image: '',
    },
    validate: {
      name: (value) =>
        value.length < 2
          ? "Ism kamida 2 ta belgidan iborat bo'lishi kerak"
          : null,
      image: (value) =>
        value.startsWith('http')
          ? null
          : 'Rasm manzili http bilan boshlanishi kerak',
    },
  })

  const handleCreateClick = () => {
    setEditingCategory(null)
    setModalMode('create')
    form.reset()
    setModalOpened(true)
  }

  const handleEditClick = (category: ICategory) => {
    setEditingCategory(category)
    setModalMode('edit')
    form.setValues({ name: category.name, image: category.image })
    setModalOpened(true)
  }

  const handleSubmit = (values: ICategoryForm) => {
    if (modalMode === 'create') {
      createMutation.mutate(values, {
        onSuccess: () => {
          setModalOpened(false)
          form.reset()
        },
      })
    } else if (modalMode === 'edit' && editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: values },
        {
          onSuccess: () => {
            setModalOpened(false)
            form.reset()
          },
        }
      )
    }
  }

  if (isLoading) {
    return (
      <Card withBorder radius="md">
        <Stack gap="md">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={60} radius="md" />
          ))}
        </Stack>
      </Card>
    )
  }

  if (isError) {
    return (
      <Alert color="red" title="Xatolik">
        Kategoriyalarni yuklashda xatolik yuz berdi
      </Alert>
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Box>
          <Title order={2}>Categories Management</Title>
          <Text c="dimmed" size="sm">
            Barcha kategoriyalarni boshqarish
          </Text>
        </Box>
        <Button
          color="anor"
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateClick}
        >
          Yangi kategoriya
        </Button>
      </Group>

      <Card withBorder radius="md" padding="md">
        <Group mb="md" gap="xs">
          <IconCategory size={20} color="gray" />
          <Text fw={500} c="dimmed">
            Jami: {categories?.length || 0} ta kategoriya
          </Text>
        </Group>

        {!categories || categories.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconCategory size={48} color="gray" opacity={0.5} />
              <Text c="dimmed">Kategoriyalar topilmadi</Text>
            </Stack>
          </Center>
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Rasm</Table.Th>
                <Table.Th>Nomi</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Harakatlar</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {categories.map((category) => (
                <Table.Tr key={category.id}>
                  <Table.Td>
                    <Avatar src={category.image} radius="md" size="lg" />
                  </Table.Td>
                  <Table.Td>
                    <Text fw={700}>{category.name}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Tahrirlash">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditClick(category)}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="O'chirish">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => setDeletingCategory(category)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <Box
              c={modalMode === 'create' ? 'blue' : 'orange'}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {modalMode === 'create' ? (
                <IconPlus size={20} />
              ) : (
                <IconPencil size={20} />
              )}
            </Box>
            <Text fw={600}>
              {modalMode === 'create'
                ? "Yangi kategoriya qo'shish"
                : 'Kategoriyani tahrirlash'}
            </Text>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Kategoriya nomi"
              placeholder="Masalan: Telefonlar"
              withAsterisk
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Rasm manzili"
              placeholder="https://..."
              withAsterisk
              {...form.getInputProps('image')}
            />
            {form.values.image && form.values.image.startsWith('http') && (
              <Box>
                <Text size="sm" fw={500} mb={4}>
                  Prevyu:
                </Text>
                <Avatar src={form.values.image} radius="md" size="xl" />
              </Box>
            )}
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Bekor qilish
              </Button>
              <Button
                type="submit"
                color={modalMode === 'create' ? 'blue' : 'orange'}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {modalMode === 'create' ? "Qo'shish" : 'Saqlash'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        opened={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title={
          <Group gap="xs">
            <Box c="red" style={{ display: 'flex', alignItems: 'center' }}>
              <IconTrash size={20} />
            </Box>
            <Text fw={600}>Kategoriyani o'chirish</Text>
          </Group>
        }
      >
        <Text mb="xl">
          Rostdan ham '{deletingCategory?.name}' kategoriyasini
          o'chirmoqchimisiz?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeletingCategory(null)}>
            Bekor qilish
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => {
              if (deletingCategory) {
                deleteMutation.mutate(deletingCategory.id, {
                  onSuccess: () => setDeletingCategory(null),
                })
              }
            }}
          >
            O'chirish
          </Button>
        </Group>
      </Modal>
    </Stack>
  )
}
