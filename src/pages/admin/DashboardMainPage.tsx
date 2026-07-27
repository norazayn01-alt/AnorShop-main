import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  SimpleGrid,
  Paper,
  ThemeIcon,
  Title,
  Text,
  Group,
  Card,
  Badge,
  Avatar,
  ActionIcon,
  Grid,
  Progress,
  Skeleton,
  Alert,
  Button,
  Table,
  Stack,
  Flex,
  Box,
} from '@mantine/core'
import {
  IconPackage,
  IconCategory,
  IconCurrencyDollar,
  IconEye,
  IconPlus,
} from '@tabler/icons-react'
import { useProducts, useCategories } from '../../hooks/useProducts'

export const DashboardMainPage = () => {
  const {
    data: products,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useProducts()
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories()

  const totalProducts = useMemo(() => products?.length || 0, [products])
  const totalCategories = useMemo(() => categories?.length || 0, [categories])
  const averagePrice = useMemo(() => {
    if (!products || products.length === 0) return '0.00'
    const sum = products.reduce((acc, p) => acc + p.price, 0)
    return (sum / products.length).toFixed(2)
  }, [products])

  const recentProducts = useMemo(() => {
    if (!products) return []
    return products.slice(0, 5)
  }, [products])

  const categoryStats = useMemo(() => {
    if (!products || !categories) return []

    return categories.map((cat) => {
      const count = products.filter((p) => p.category?.id === cat.id).length
      const percentage = totalProducts > 0 ? (count / totalProducts) * 100 : 0
      return {
        ...cat,
        count,
        percentage,
      }
    })
  }, [products, categories, totalProducts])

  const colors = ['anor', 'blue', 'teal', 'orange', 'grape', 'cyan', 'pink']

  const isLoading = isProductsLoading || isCategoriesLoading
  const isError = isProductsError || isCategoriesError

  if (isLoading) {
    return (
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Skeleton height={140} radius="md" />
          <Skeleton height={140} radius="md" />
          <Skeleton height={140} radius="md" />
        </SimpleGrid>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
        </Grid>
      </Stack>
    )
  }

  if (isError) {
    return (
      <Alert color="red" title="Xatolik" variant="light">
        Ma'lumotlarni yuklashda xatolik yuz berdi
      </Alert>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="lg" wrap="wrap" gap="md">
        <Box>
          <Title order={2}>Dashboard Overview</Title>
          <Text c="dimmed" size="sm">
            Tizimdagi umumiy statistika va so'nggi mahsulotlar
          </Text>
        </Box>
        <Button
          component={Link}
          to="/dashboard/products"
          color="anor"
          leftSection={<IconPlus size={16} />}
        >
          Add New Product
        </Button>
      </Flex>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Products
              </Text>
              <Title order={2} fw={800} fz={32} mt="xs">
                {totalProducts}
              </Title>
            </Box>
            <ThemeIcon color="anor" variant="light" size={48} radius="md">
              <IconPackage size={24} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Categories
              </Text>
              <Title order={2} fw={800} fz={32} mt="xs">
                {totalCategories}
              </Title>
            </Box>
            <ThemeIcon color="blue" variant="light" size={48} radius="md">
              <IconCategory size={24} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Average Price
              </Text>
              <Title order={2} fw={800} fz={32} mt="xs">
                ${averagePrice}
              </Title>
            </Box>
            <ThemeIcon color="teal" variant="light" size={48} radius="md">
              <IconCurrencyDollar size={24} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Top Featured Products</Title>
              <Button
                component={Link}
                to="/dashboard/products"
                variant="subtle"
                color="anor"
                size="sm"
              >
                View All Products
              </Button>
            </Group>

            <Table.ScrollContainer minWidth={500}>
              <Table verticalSpacing="sm" striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th style={{ width: 80 }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentProducts.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar
                            src={product.images?.[0]}
                            size={40}
                            radius="md"
                            color="gray"
                          >
                            {product.title.charAt(0).toUpperCase()}
                          </Avatar>
                          <Text fz="sm" fw={500}>
                            {product.title}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray">
                          {product.category?.name || 'Uncategorized'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={700} style={{ color: '#A30041' }}>
                          ${product.price}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <ActionIcon
                          component={Link}
                          to={`/dashboard/products/${product.id}`}
                          variant="light"
                          color="gray"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {recentProducts.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text ta="center" c="dimmed" py="md">
                          No products found
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="md" h="100%">
            <Title order={3} mb="lg">
              Category Shares
            </Title>

            <Stack gap="md">
              {categoryStats.map((stat, index) => {
                const color = colors[index % colors.length]
                return (
                  <Box key={stat.id}>
                    <Group justify="space-between" mb="xs">
                      <Text fz="sm" fw={500}>
                        {stat.name}
                      </Text>
                      <Group gap="xs">
                        <Text fz="sm" fw={700}>
                          {stat.count}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          ({stat.percentage.toFixed(1)}%)
                        </Text>
                      </Group>
                    </Group>
                    <Progress
                      value={stat.percentage}
                      color={color}
                      size="sm"
                      radius="xl"
                    />
                  </Box>
                )
              })}
              {categoryStats.length === 0 && (
                <Text ta="center" c="dimmed" py="md">
                  No categories found
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
