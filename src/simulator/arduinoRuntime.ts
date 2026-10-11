import type { CompilerDiagnostic, PlacedComponent } from "./types"
import type { McuOutputState } from "./electricalEngine"

export interface CompilationResult {
  success: boolean
  diagnostics: CompilerDiagnostic[]
  transpiledCode?: string
}

/**
 * Normalize Arduino pin identifier (e.g., 13 -> "D13", "A0" -> "A0", 0 -> "D0")
 */
export function normalizePinId(pin: number | string): string {
  if (typeof pin === "string") {
    const trimmed = pin.trim().toUpperCase()
    if (trimmed.startsWith("A") || trimmed.startsWith("D")) return trimmed
    const parsed = Number(trimmed)
    if (!Number.isNaN(parsed)) {
      return parsed >= 14 && parsed <= 19 ? `A${parsed - 14}` : `D${parsed}`
    }
    return trimmed
  }
  const num = Math.round(Number(pin))
  if (num >= 14 && num <= 19) {
    return `A${num - 14}`
  }
  return `D${num}`
}

/**
 * Performs static syntax and structural verification on Arduino C/C++ source code,
 * and transpiles it into an executable step-yielding generator function.
 */
export function compileArduinoSketch(sourceCode: string): CompilationResult {
  const diagnostics: CompilerDiagnostic[] = []
  const lines = sourceCode.split(/\r?\n/)

  // 1. Check brace balance
  let braceDepth = 0
  let parenDepth = 0
  let inBlockComment = false

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    let line = rawLine

    // Strip comments for checking
    if (inBlockComment) {
      const endIdx = line.indexOf("*/")
      if (endIdx !== -1) {
        inBlockComment = false
        line = line.slice(endIdx + 2)
      } else {
        continue
      }
    }
    line = line.replace(/\/\*[\s\S]*?\*\//g, "")
    const startBlock = line.indexOf("/*")
    if (startBlock !== -1) {
      inBlockComment = true
      line = line.slice(0, startBlock)
    }
    const slashIdx = line.indexOf("//")
    if (slashIdx !== -1) {
      line = line.slice(0, slashIdx)
    }

    for (let c = 0; c < line.length; c++) {
      const ch = line[c]
      if (ch === "{") braceDepth++
      else if (ch === "}") {
        braceDepth--
        if (braceDepth < 0) {
          diagnostics.push({
            line: i + 1,
            column: c + 1,
            severity: "error",
            message: "Unexpected closing brace '}' without matching '{'.",
          })
          braceDepth = 0
        }
      } else if (ch === "(") parenDepth++
      else if (ch === ")") {
        parenDepth--
        if (parenDepth < 0) {
          diagnostics.push({
            line: i + 1,
            column: c + 1,
            severity: "error",
            message: "Unexpected closing parenthesis ')' without matching '('.",
          })
          parenDepth = 0
        }
      }
    }

    // Check common semicolon omissions on core calls
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith(":") &&
      !/^(if|else|for|while|switch|void|int|long|float|double|bool|boolean|char|String)\b/.test(trimmed) &&
      /\b(pinMode|digitalWrite|analogWrite|delay|delayMicroseconds|Serial\.|lcd\.|myServo\.)/.test(trimmed)
    ) {
      diagnostics.push({
        line: i + 1,
        column: rawLine.length,
        severity: "error",
        message: `Expected ';' at end of statement on line ${i + 1}.`,
      })
    }
  }

  if (braceDepth > 0) {
    diagnostics.push({
      line: lines.length,
      column: 1,
      severity: "error",
      message: `Unclosed '{': missing ${braceDepth} closing brace(s) '}'.`,
    })
  }
  if (parenDepth > 0) {
    diagnostics.push({
      line: lines.length,
      column: 1,
      severity: "error",
      message: `Unclosed '(': missing ${parenDepth} closing parenthesis ')'.`,
    })
  }

  // 2. Verify setup() and loop() exist
  if (!/\bvoid\s+setup\s*\(/.test(sourceCode)) {
    diagnostics.push({
      line: 1,
      column: 1,
      severity: "error",
      message: "Missing required Arduino entry function 'void setup()'.",
    })
  }
  if (!/\bvoid\s+loop\s*\(/.test(sourceCode)) {
    diagnostics.push({
      line: 1,
      column: 1,
      severity: "error",
      message: "Missing required Arduino loop function 'void loop()'.",
    })
  }

  if (diagnostics.some((d) => d.severity === "error")) {
    return { success: false, diagnostics }
  }

  // 3. Transform C/C++ Arduino source into JS generator body
  try {
    let code = sourceCode

    // Remove block and line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, "")
    code = code
      .split(/\r?\n/)
      .map((l) => {
        const idx = l.indexOf("//")
        return idx !== -1 ? l.slice(0, idx) : l
      })
      .join("\n")

    // Remove #include lines
    code = code.replace(/^\s*#include\s+[<"][^>"]+[>"]\s*$/gm, "")

    // Convert #define MACROS
    code = code.replace(/^\s*#define\s+([A-Za-z_]\w*)\s+(.+)$/gm, "const $1 = $2;")

    // Convert F("...") macro to plain string
    code = code.replace(/\bF\s*\(\s*("[^"]*")\s*\)/g, "$1")

    // Convert LiquidCrystal_I2C / LiquidCrystal / Servo / DHT declarations
    code = code.replace(
      /\bLiquidCrystal_I2C\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*;/g,
      "const $1 = __rt.createLcd($2);"
    )
    code = code.replace(
      /\bLiquidCrystal\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*;/g,
      "const $1 = __rt.createLcd($2);"
    )
    code = code.replace(
      /\bServo\s+([A-Za-z_]\w*)\s*;/g,
      "const $1 = __rt.createServo();"
    )
    code = code.replace(
      /\bDHT\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*;/g,
      "const $1 = __rt.createDht($2);"
    )

    // Convert user function declarations: e.g. void setup() -> async function* setup()
    code = code.replace(
      /\b(?:void|int|long|unsigned\s+long|float|double|bool|boolean|char|String)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/g,
      (_match, fnName, rawParams) => {
        const cleanParams = rawParams
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean)
          .map((p: string) => {
            const parts = p.replace(/\[\s*\]/g, "").trim().split(/\s+/)
            return parts[parts.length - 1]
          })
          .join(", ")
        return `function* ${fnName}(${cleanParams}) {`
      }
    )

    // Convert typed array declarations: const int pins[] = {1, 2}; -> const pins = [1, 2];
    code = code.replace(
      /\b(?:const\s+)?(?:unsigned\s+)?(?:int|long|float|double|bool|boolean|byte|char|uint8_t|uint16_t|uint32_t|String)\s+([A-Za-z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\}/g,
      "let $1 = [$2]"
    )

    // Convert const typed variable declarations: const int ledPin = 13 -> const ledPin = 13
    code = code.replace(
      /\bconst\s+(?:unsigned\s+)?(?:int|long|float|double|bool|boolean|byte|char|uint8_t|uint16_t|uint32_t|String)\s+/g,
      "const "
    )

    // Convert static / mutable typed variable declarations: int x = 5 -> let x = 5
    code = code.replace(
      /\b(?:static\s+)?(?:unsigned\s+)?(?:int|long|float|double|bool|boolean|byte|char|uint8_t|uint16_t|uint32_t|String)\s+/g,
      "let "
    )

    // Replace delay() and delayMicroseconds() with generator yields
    code = code.replace(/\bdelay\s*\(([^)]+)\)/g, "(yield { type: 'delay', ms: ($1) })")
    code = code.replace(
      /\bdelayMicroseconds\s*\(([^)]+)\)/g,
      "(yield { type: 'delay', ms: (($1) / 1000) })"
    )

    return {
      success: true,
      diagnostics,
      transpiledCode: code,
    }
  } catch (err: any) {
    diagnostics.push({
      line: 1,
      column: 1,
      severity: "error",
      message: `Compilation error: ${err?.message || "Invalid C/C++ syntax"}`,
    })
    return { success: false, diagnostics }
  }
}

export interface RuntimeCallbacks {
  onSerialPrint: (text: string, newline: boolean) => void
  onStateUpdated: () => void
  getPinInput: (pinId: string) => { digital: 0 | 1; analogAdc: number; voltage: number }
  getComponents: () => PlacedComponent[]
  getSimTimeMs: () => number
}

/**
 * Interactive Arduino Execution Engine
 * Runs transpiled `setup()` and `loop()` generators cleanly, yielding on `delay()` calls
 * and updating `McuOutputState` in real time.
 */
export class ArduinoSimulatorRuntime {
  private mcuState: McuOutputState
  private callbacks: RuntimeCallbacks
  private generator: Generator<any, void, unknown> | null = null

  constructor(mcuState: McuOutputState, callbacks: RuntimeCallbacks) {
    this.mcuState = mcuState
    this.callbacks = callbacks
  }

  public initialize(transpiledCode: string): void {
    const rt = this.createRuntimeApi()

    const wrappedSource = `
      const {
        HIGH, LOW, INPUT, OUTPUT, INPUT_PULLUP,
        A0, A1, A2, A3, A4, A5, LED_BUILTIN,
        pinMode, digitalWrite, digitalRead, analogRead, analogWrite,
        millis, micros, pulseIn, tone, noTone,
        map, constrain, abs, min, max, random,
        Serial
      } = __rt;

      ${transpiledCode}

      return (function* __mainRunner() {
        if (typeof setup === "function") {
          yield* setup();
        }
        while (true) {
          if (typeof loop === "function") {
            yield* loop();
          }
          yield { type: "tick", ms: 10 };
        }
      })();
    `

    // Construct generator
    const factory = new Function("__rt", wrappedSource)
    this.generator = factory(rt)
  }

  /**
   * Executes code until the next `delay(ms)` or loop boundary and returns how many ms to wait.
   */
  public step(): number {
    if (!this.generator) return 50
    let safetyCounter = 0
    while (safetyCounter < 200) {
      safetyCounter++
      const res = this.generator.next()
      if (res.done) return 50
      const val = res.value as { type?: string; ms?: number } | undefined
      if (val && (val.type === "delay" || val.type === "tick")) {
        this.callbacks.onStateUpdated()
        return Math.max(1, Number(val.ms ?? 10))
      }
    }
    this.callbacks.onStateUpdated()
    return 10
  }

  private createRuntimeApi() {
    const self = this
    let serialLineBuffer = ""

    const emitSerial = (val: any, newline: boolean) => {
      const str = val === undefined || val === null ? "" : String(val)
      serialLineBuffer += str
      if (newline) {
        self.callbacks.onSerialPrint(serialLineBuffer, true)
        serialLineBuffer = ""
      }
    }

    return {
      HIGH: 1,
      LOW: 0,
      INPUT: "INPUT",
      OUTPUT: "OUTPUT",
      INPUT_PULLUP: "INPUT_PULLUP",
      LED_BUILTIN: 13,
      A0: "A0",
      A1: "A1",
      A2: "A2",
      A3: "A3",
      A4: "A4",
      A5: "A5",

      pinMode: (pin: number | string, mode: "INPUT" | "OUTPUT" | "INPUT_PULLUP") => {
        const pinId = normalizePinId(pin)
        self.mcuState.pinModes[pinId] = mode
        if (mode === "INPUT_PULLUP") {
          self.mcuState.digitalOutputs[pinId] = 1
        }
        self.callbacks.onStateUpdated()
      },

      digitalWrite: (pin: number | string, value: number | boolean) => {
        const pinId = normalizePinId(pin)
        self.mcuState.pinModes[pinId] = "OUTPUT"
        delete self.mcuState.pwmOutputs[pinId]
        self.mcuState.digitalOutputs[pinId] = value ? 1 : 0
        self.callbacks.onStateUpdated()
      },

      digitalRead: (pin: number | string): 0 | 1 => {
        const pinId = normalizePinId(pin)
        const input = self.callbacks.getPinInput(pinId)
        return input ? input.digital : 0
      },

      analogRead: (pin: number | string): number => {
        const pinId =
          typeof pin === "number" && pin <= 5 ? `A${pin}` : normalizePinId(pin)
        const input = self.callbacks.getPinInput(pinId)
        return input ? input.analogAdc : 0
      },

      analogWrite: (pin: number | string, duty: number) => {
        const pinId = normalizePinId(pin)
        const clamped = Math.max(0, Math.min(255, Math.round(Number(duty) || 0)))
        self.mcuState.pinModes[pinId] = "OUTPUT"
        self.mcuState.pwmOutputs[pinId] = clamped
        self.mcuState.digitalOutputs[pinId] = clamped >= 128 ? 1 : 0
        self.callbacks.onStateUpdated()
      },

      millis: () => Math.round(self.callbacks.getSimTimeMs()),
      micros: () => Math.round(self.callbacks.getSimTimeMs() * 1000),

      pulseIn: (_pin: number | string, _state: number): number => {
        // Check if an HC-SR04 Ultrasonic sensor is placed on the canvas
        const comps = self.callbacks.getComponents()
        const us = comps.find((c) => c.type === "ultrasonic_hcsr04")
        const distanceCm = us ? Number(us.properties.distanceCm ?? 45) : 50
        return Math.round((distanceCm * 2) / 0.034)
      },

      tone: (pin: number | string, frequency: number) => {
        const pinId = normalizePinId(pin)
        self.mcuState.toneFrequencies[pinId] = Math.max(20, Number(frequency) || 1000)
        self.callbacks.onStateUpdated()
      },

      noTone: (pin: number | string) => {
        const pinId = normalizePinId(pin)
        delete self.mcuState.toneFrequencies[pinId]
        self.callbacks.onStateUpdated()
      },

      map: (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
        if (inMax === inMin) return outMin
        return Math.round(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin)
      },
      constrain: (x: number, a: number, b: number) => Math.max(a, Math.min(b, x)),
      abs: Math.abs,
      min: Math.min,
      max: Math.max,
      random: (minOrMax: number, maybeMax?: number) => {
        if (maybeMax === undefined) return Math.floor(Math.random() * minOrMax)
        return Math.floor(Math.random() * (maybeMax - minOrMax)) + minOrMax
      },

      Serial: {
        begin: (_baud: number) => {},
        print: (val: any) => emitSerial(val, false),
        println: (val?: any) => emitSerial(val ?? "", true),
        printf: (fmt: string, ...args: any[]) => {
          let i = 0
          const formatted = String(fmt).replace(/%[dluifs]/g, () =>
            String(args[i++] ?? "")
          )
          emitSerial(formatted.replace(/\n$/, ""), true)
        },
      },

      createServo: () => {
        let attachedPin = "D9"
        return {
          attach: (pin: number | string) => {
            attachedPin = normalizePinId(pin)
            self.mcuState.servoAngles[attachedPin] = 90
            self.callbacks.onStateUpdated()
          },
          write: (angle: number) => {
            const clamped = Math.max(0, Math.min(180, Math.round(Number(angle) || 0)))
            self.mcuState.servoAngles[attachedPin] = clamped
            self.callbacks.onStateUpdated()
          },
          read: () => self.mcuState.servoAngles[attachedPin] ?? 90,
        }
      },

      createLcd: () => {
        let cursorCol = 0
        let cursorRow = 0
        return {
          init: () => {
            self.mcuState.lcdState.lines = ["                ", "                "]
            self.callbacks.onStateUpdated()
          },
          begin: () => {
            self.mcuState.lcdState.lines = ["                ", "                "]
            self.callbacks.onStateUpdated()
          },
          backlight: () => {
            self.mcuState.lcdState.backlight = true
            self.callbacks.onStateUpdated()
          },
          noBacklight: () => {
            self.mcuState.lcdState.backlight = false
            self.callbacks.onStateUpdated()
          },
          clear: () => {
            self.mcuState.lcdState.lines = ["                ", "                "]
            cursorCol = 0
            cursorRow = 0
            self.callbacks.onStateUpdated()
          },
          setCursor: (col: number, row: number) => {
            cursorCol = Math.max(0, Math.min(15, Number(col) || 0))
            cursorRow = Math.max(0, Math.min(1, Number(row) || 0))
          },
          print: (val: any) => {
            const text = String(val ?? "")
            const currentLine = (self.mcuState.lcdState.lines[cursorRow] || "").padEnd(16, " ")
            const prefix = currentLine.slice(0, cursorCol)
            const updated = (prefix + text).padEnd(16, " ").slice(0, 16)
            self.mcuState.lcdState.lines[cursorRow] = updated
            cursorCol = Math.min(15, cursorCol + text.length)
            self.callbacks.onStateUpdated()
          },
        }
      },

      createDht: () => {
        return {
          begin: () => {},
          readTemperature: () => {
            const comps = self.callbacks.getComponents()
            const dht = comps.find((c) => c.type === "dht11")
            return dht ? Number(dht.properties.temperatureC ?? 25.0) : 25.0
          },
          readHumidity: () => {
            const comps = self.callbacks.getComponents()
            const dht = comps.find((c) => c.type === "dht11")
            return dht ? Number(dht.properties.humidityPct ?? 55) : 55
          },
        }
      },
    }
  }
}

