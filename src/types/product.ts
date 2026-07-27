export interface ICategory {
  id: number
  name: string
  slug: string
  image: string
}

export interface IProduct {
  id: number
  title: string
  slug: string
  price: number
  description: string
  category: ICategory
  images: string[]
}

/** API query params for /products endpoint */
export interface TProductParams {
  offset?: number
  limit?: number
  title?: string
  categoryId?: number
  price_min?: number
  price_max?: number
}

/** Payload for creating / updating a product */
export interface IProductForm {
  title: string
  price: number
  description: string
  categoryId: number
  images: string[]
}

/** Payload for creating / updating a category */
export interface ICategoryForm {
  name: string
  image: string
}
