import { queryDataset } from './tools/queryDataset.js'
import { describeDataset } from './tools/describeDataset.js'

export interface MCPToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export const mcpTools: MCPToolDefinition[] = [
  {
    name: 'query_dataset',
    description: 'Translate a natural language question into SQL and execute it against a dataset',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: { type: 'string', description: 'The ID of the dataset to query' },
        question: { type: 'string', description: 'The natural language question' },
      },
      required: ['datasetId', 'question'],
    },
  },
  {
    name: 'describe_dataset',
    description: 'Get metadata and schema information about a dataset',
    inputSchema: {
      type: 'object',
      properties: {
        datasetId: { type: 'string', description: 'The ID of the dataset to describe' },
      },
      required: ['datasetId'],
    },
  },
]

export async function invokeTool(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'query_dataset':
      return queryDataset(input as { datasetId: string; question: string })
    case 'describe_dataset':
      return describeDataset(input as { datasetId: string })
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
