export const products = {
  worth_it: {
    priceId: 'price_1RQVn9RHxFFLCbAY6L0Ykdqe',
    name: 'worth it',
    description: 'Get access to all features',
    mode: 'payment'
  }
} as const;

export type ProductId = keyof typeof products;