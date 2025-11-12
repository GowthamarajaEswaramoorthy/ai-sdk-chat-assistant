## **_NOTE_**: This is NOT an official commercetools code and NOT production ready. Use it at your own risk

<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a></br>
  <b>AI-Powered Customer Service Assistant</b>
</p>

This is an AI-powered customer service chatbot built with commercetools Connect and the Vercel AI SDK. The assistant helps customer service representatives quickly find customer information and order details by natural language queries.

## Features

### Customer Service Capabilities

- **Customer Lookup**: Find customers by their first and last name
- **Order History**: Retrieve complete order history for any customer
- **Order Details**: View detailed information about orders including:
  - Order number and status
  - Line items with quantities and prices
  - Shipping and billing addresses
  - Order dates and total amounts
- **Product Information**: Access product catalog and details
- **Cart Management**: View and manage customer carts

### AI-Powered Tools

The assistant includes several AI tools for customer service operations:

1. **findCustomerByName**: Search for customers by first and last name
2. **getCustomerOrders**: Retrieve all orders for a specific customer
3. **findCustomerWithOrders**: Combined search that returns customer info and their orders in one call
4. **read_cart**: View cart contents
5. **read_products**: Search and browse product catalog
6. **read_category**: View product categories
7. **read_order**: Get specific order details

## Usage

### Example Queries

The AI assistant can respond to natural language queries such as:

- "Can you help me find orders for John Smith?"
- "What orders does Jane Doe have?"
- "Show me the order history for customer Sarah Johnson"
- "Find all orders for Michael Brown and their current status"

### API Endpoint

The chatbot exposes a POST endpoint at `/chat` that accepts:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Find orders for John Smith"
    }
  ]
}
```

Optional query parameters:

- `customerId`: Pre-identified customer ID for context
- `cartId`: Active cart ID if applicable
- `locale`: Preferred locale for responses
- `currentPath`: Current page context in the application

## Architecture

The application follows a modular architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic for customer and order operations
- **Tools**: AI tool definitions for the chatbot
- **Middleware**: Authentication and error handling
- **Utils**: Logging and prompt management

## Configuration

Key environment variables (configured via `connect.yaml`):

- **CTP_PROJECT_KEY**: commercetools project key
- **CTP_CLIENT_ID**: commercetools API client ID
- **CTP_CLIENT_SECRET**: commercetools API client secret
- **AI_PROVIDER**: AI provider (openai or anthropic)
- **AI_MODEL**: Specific AI model to use
- **AVAILABLE_TOOLS**: JSON configuration of enabled tools
- **SYSTEM_PROMPT**: Custom system prompt for the AI assistant
- **MAX_STEPS**: Maximum AI reasoning steps (default: 25)

## Instructions

Use `create-connect-app` cli with `starter-typescript` as `template` value to download this template repository to build the integration application , folder structure needs to be followed to ensure certification & deployment from commercetools connect team as stated [here](https://github.com/commercetools/connect-application-kit#readme)

## Architecture principles for building an connect application

- Connector solution should be lightweight in nature
- Connector solutions should follow test driven development. Unit , Integration (& E2E) tests should be included and successfully passed to be used
- No hardcoding of customer related config. If needed, values in an environment file which should not be maintained in repository
- Connector solution should be supported with detailed documentation
- Connectors should be point to point in nature, currently doesnt support any persistence capabilities apart from in memory persistence
- Connector solution should use open source technologies, although connector itself can be private for specific customer(s)
- Code should not contain console.log statements, use [the included logger](https://github.com/commercetools/merchant-center-application-kit/tree/main/packages-backend/loggers#readme) instead.

## Development

### Install Dependencies

```bash
cd chat
yarn install
```

### Run Locally

```bash
yarn start:dev
```

### Build

```bash
yarn build
```

### Deploy

Deploy the connector to commercetools Connect following the standard deployment process.

## Technology Stack

- **Framework**: Express.js with TypeScript
- **AI SDK**: Vercel AI SDK
- **AI Providers**: OpenAI (GPT-4, GPT-4o), Anthropic (Claude)
- **E-commerce Platform**: commercetools Composable Commerce
- **Tools**: @commercetools/agent-essentials for AI-powered commerce operations
