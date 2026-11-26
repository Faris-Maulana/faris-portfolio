import { immutable } from './immutable'
import type { ToolName, ToolSpec } from './types'

export const TOOL_CATALOG: DeepReadonlyTools = immutable({
  'transport.reroute': {
    name: 'transport.reroute',
    action: 'reroute-service',
    description: 'Simulates a protected path change for one declared service target.',
    inputSchema: {
      type: 'object',
      required: ['runId', 'target'],
      properties: {
        runId: { type: 'string', description: 'Exact simulation run identity.' },
        target: { type: 'string', description: 'Exact synthetic service identity.' },
      },
      additionalProperties: false,
    },
  },
  'transport.isolate': {
    name: 'transport.isolate',
    action: 'isolate-link',
    description: 'Simulates isolation of one declared synthetic link.',
    inputSchema: {
      type: 'object',
      required: ['runId', 'target'],
      properties: {
        runId: { type: 'string', description: 'Exact simulation run identity.' },
        target: { type: 'string', description: 'Exact synthetic link identity.' },
      },
      additionalProperties: false,
    },
  },
  'alerts.correlate': {
    name: 'alerts.correlate',
    action: 'correlate-alerts',
    description: 'Records correlation of accepted NMS evidence without changing topology.',
    inputSchema: {
      type: 'object',
      required: ['runId', 'target'],
      properties: {
        runId: { type: 'string', description: 'Exact simulation run identity.' },
        target: { type: 'string', description: 'Exact synthetic alert scope.' },
      },
      additionalProperties: false,
    },
  },
  'field.inspect': {
    name: 'field.inspect',
    action: 'inspect-path',
    description: 'Requests a synthetic field inspection and preserves unresolved telemetry.',
    inputSchema: {
      type: 'object',
      required: ['runId', 'target'],
      properties: {
        runId: { type: 'string', description: 'Exact simulation run identity.' },
        target: { type: 'string', description: 'Exact synthetic path identity.' },
      },
      additionalProperties: false,
    },
  },
})

type DeepReadonlyTools = Readonly<Record<ToolName, ToolSpec>>
