import { CONTEXT_HYDRATION_PROMPT } from '../contants';

export const hydratePrompt = (prompt: string, context: any) => {
  if (context.customerId) {
    prompt += CONTEXT_HYDRATION_PROMPT.customerId.replace('{{customerId}}', context.customerId);
  }
  if (context.cartId) {
    prompt += CONTEXT_HYDRATION_PROMPT.cartId.replace('{{cartId}}', context.cartId);
  }
  if (context.locale) {
    prompt += CONTEXT_HYDRATION_PROMPT.locale.replace('{{locale}}', context.locale);
  }
  if (context.currentPath) {
    prompt += CONTEXT_HYDRATION_PROMPT.currentPath.replace('{{currentPath}}', context.currentPath);
  }
  return prompt;
};
