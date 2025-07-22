import { tool } from 'ai';
import { z } from 'zod';

const navigatetoPageTool = tool({

  description:
    `Navigate to a specific page. pages are: home, product (PDP), category (PLP), search, cart, checkout.
    - Note: to view Items in cart you don't need to navigate to cart page. use other tools to view items in cart.`,
  parameters: z.object({
    page: z.enum(['home', 'product', 'category', 'search', 'cart', 'checkout']).describe('The page to navigate to'),
    sku: z.string().optional().describe('The sku of the product to navigate to'),
    categoryKey: z.string().optional().describe('The key of the category to navigate to'),
    searchQuery: z.string().optional().describe('The search query to navigate to'),
  }),
});

export const injectNavigationTools = (tools: Record<string, any>) => {
  return {
    ...tools,
    navigateToPage: navigatetoPageTool,
  };
};
