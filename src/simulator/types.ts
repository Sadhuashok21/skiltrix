export type ComponentCategory =
  | "microcontrollers"
  | "basic"
  | "sensors"
  | "outputs"
  | "instruments"

export type PinType =
  | "digital"
  | "analog"
  | "pwm"
  | "power"
  | "ground"
  | "terminal"
  | "i2c"
  | "uart"

export interface PinDefinition {
  id: string
  label: string
  /** Relative offset from component top-left (in grid pixels) */
  x: number
  y: number
  type: PinType
  /** Direction for pin lead line rendering */
  leadDirection?: "top" | "bottom" | "left" | "right" | "none"
  description?: string
}

export interface ComponentPropertySchema {
  key: string
  label: string
  type: "number" | "string" | "select" | "color" | "range" | "boolean"
  options?: Array<{ label: string; value: string | number }>
  min?: number
  max?: number
  step?: number
  unit?: string
}

export interface ComponentCatalogItem {
  type: string
  name: string
  category: ComponentCategory
  prefix: string
  description: string
  width: number
  height: number
  pins: PinDefinition[]
  defaultProperties: Record<string, any>
  propertySchema: ComponentPropertySchema[]
  codeExample?: string
}

export interface PlacedComponent {
  id: string
  type: string
  designator: string
  x: number
  y: number
  rotation: 0 | 90 | 180 | 270
  properties: Record<string, any>
}

export interface WireConnection {
  id: string
  fromComponentId: string
  fromPinId: string
  toComponentId: string
  toPinId: string
  color: string
}

export interface PinElectricalState {
  voltage: number
  mode: "INPUT" | "OUTPUT" | "INPUT_PULLUP"
  digitalValue: 0 | 1
  pwmValue: number // 0..255
  netId: string
}

export interface ComponentRuntimeState {
  /** For LEDs: 0..1 brightness */
  brightness?: number
  /** Current flowing through component in mA */
  currentMa?: number
  /** Voltage drop across component */
  voltageDrop?: number
  /** Overcurrent / short warning */
  warning?: string
  /** For RGB LED */
  rgbColor?: { r: number; g: number; b: number }
  /** For Servo motor: 0..180 deg */
  angle?: number
  /** For DC motor: RPM */
  rpm?: number
  /** For Buzzer: active frequency Hz */
  frequency?: number
  /** For LCD 16x2: 2 lines of 16 chars */
  lcdLines?: [string, string]
  lcdBacklight?: boolean
  /** For 7-segment display: active segments a..g, dp */
  segments?: Record<string, boolean>
  /** For Multimeter: measured value */
  measuredVoltage?: number
  /** For Relay: energized state */
  relayClosed?: boolean
}

export interface ElectricalWarning {
  id: string
  severity: "warning" | "error"
  message: string
  componentIds?: string[]
  netId?: string
}

export interface SimulationSnapshot {
  isRunning: boolean
  isPaused: boolean
  simTimeMs: number
  pinStates: Record<string, PinElectricalState> // key: `${componentId}:${pinId}`
  componentStates: Record<string, ComponentRuntimeState> // key: componentId
  warnings: ElectricalWarning[]
  serialOutput: Array<{ timestamp: string; text: string }>
  plotterSamples: Array<{ timeMs: number; values: number[] }>
}

export interface CompilerDiagnostic {
  line: number
  column: number
  severity: "error" | "warning"
  message: string
}

export interface CircuitProjectSchema {
  schemaVersion: "1.0.0"
  projectId: string
  name: string
  boardType: string
  components: PlacedComponent[]
  wires: WireConnection[]
  code: string
  updatedAt: string
}

