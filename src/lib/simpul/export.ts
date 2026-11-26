import { immutable } from './immutable'
import type { ReplayExport, SimulationRun } from './types'

export function createReplayExport(run: SimulationRun): ReplayExport {
  return immutable({
    schema: 'simpul.replay.v1',
    traceType: 'deterministic-reference',
    notice: 'Synthetic deterministic reference run. No live model inference, production telemetry or production control.',
    run,
  })
}
