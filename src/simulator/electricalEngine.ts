import { getCatalogItem } from "./componentLibrary"
import type {
  PlacedComponent,
  WireConnection,
  PinDefinition,
  PinElectricalState,
  ComponentRuntimeState,
  ElectricalWarning,
} from "./types"

export interface WorldPinPosition {
  x: number
  y: number
  leadDirection: "top" | "bottom" | "left" | "right" | "none"
}

/**
 * Computes the absolute canvas coordinates of a component pin, taking rotation into account.
 */
export function getPinWorldPosition(
  comp: PlacedComponent,
  pin: PinDefinition
): WorldPinPosition {
  const catalog = getCatalogItem(comp.type)
  const w = catalog?.width || 100
  const h = catalog?.height || 100
  const cx = w / 2
  const cy = h / 2

  const dx = pin.x - cx
  const dy = pin.y - cy

  let rx = dx
  let ry = dy
  let dir = pin.leadDirection || "none"

  const dirOrder: Array<"top" | "right" | "bottom" | "left"> = ["top", "right", "bottom", "left"]
  const rotateDir = (
    d: "top" | "bottom" | "left" | "right" | "none",
    steps: number
  ): "top" | "bottom" | "left" | "right" | "none" => {
    if (d === "none") return "none"
    const idx = dirOrder.indexOf(d)
    return dirOrder[(idx + steps) % 4]
  }

  switch (comp.rotation) {
    case 90:
      rx = -dy
      ry = dx
      dir = rotateDir(dir, 1)
      break
    case 180:
      rx = -dx
      ry = -dy
      dir = rotateDir(dir, 2)
      break
    case 270:
      rx = dy
      ry = -dx
      dir = rotateDir(dir, 3)
      break
    default:
      break
  }

  return {
    x: Math.round(comp.x + cx + rx),
    y: Math.round(comp.y + cy + ry),
    leadDirection: dir,
  }
}

/**
 * Computes an orthogonal (Manhattan) wire path with horizontal and vertical segments.
 */
export function computeOrthogonalWirePoints(
  p1: WorldPinPosition,
  p2: WorldPinPosition
): Array<{ x: number; y: number }> {
  const stubLen = 18
  const applyStub = (p: WorldPinPosition) => {
    switch (p.leadDirection) {
      case "top":
        return { x: p.x, y: p.y - stubLen }
      case "bottom":
        return { x: p.x, y: p.y + stubLen }
      case "left":
        return { x: p.x - stubLen, y: p.y }
      case "right":
        return { x: p.x + stubLen, y: p.y }
      default:
        return { x: p.x, y: p.y }
    }
  }

  const s1 = applyStub(p1)
  const s2 = applyStub(p2)
  const points: Array<{ x: number; y: number }> = [{ x: p1.x, y: p1.y }]

  if (s1.x !== p1.x || s1.y !== p1.y) {
    points.push(s1)
  }

  // Route between s1 and s2 using clean horizontal/vertical segments
  const isVertical1 = p1.leadDirection === "top" || p1.leadDirection === "bottom"
  const isVertical2 = p2.leadDirection === "top" || p2.leadDirection === "bottom"

  if (s1.x === s2.x || s1.y === s2.y) {
    // Straight segment
  } else if (isVertical1 && !isVertical2) {
    // Vertical exit from p1, horizontal entry into p2 -> single corner at (s1.x, s2.y)
    points.push({ x: s1.x, y: s2.y })
  } else if (!isVertical1 && isVertical2) {
    // Horizontal exit from p1, vertical entry into p2 -> single corner at (s2.x, s1.y)
    points.push({ x: s2.x, y: s1.y })
  } else if (isVertical1 && isVertical2) {
    const midY = Math.round((s1.y + s2.y) / 2)
    points.push({ x: s1.x, y: midY })
    points.push({ x: s2.x, y: midY })
  } else {
    const midX = Math.round((s1.x + s2.x) / 2)
    points.push({ x: midX, y: s1.y })
    points.push({ x: midX, y: s2.y })
  }

  if (s2.x !== p2.x || s2.y !== p2.y) {
    points.push(s2)
  }
  points.push({ x: p2.x, y: p2.y })

  return points
}

export function pointsToSvgPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ""
  return points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")
}

export interface McuOutputState {
  pinModes: Record<string, "INPUT" | "OUTPUT" | "INPUT_PULLUP"> // e.g. "D13": "OUTPUT"
  digitalOutputs: Record<string, 0 | 1> // e.g. "D13": 1
  pwmOutputs: Record<string, number> // e.g. "D9": 128
  servoAngles: Record<string, number> // e.g. "D9": 90
  toneFrequencies: Record<string, number> // e.g. "D8": 2000
  lcdState: {
    lines: [string, string]
    backlight: boolean
  }
}

export interface CircuitSolverResult {
  pinStates: Record<string, PinElectricalState>
  componentStates: Record<string, ComponentRuntimeState>
  warnings: ElectricalWarning[]
  mcuPinInputs: Record<string, { digital: 0 | 1; analogAdc: number; voltage: number }>
}

/**
 * Nodal Circuit Connectivity & Electrical Solver
 * Evaluates net connectivity, power/ground rails, Thévenin equivalent voltage through series resistors,
 * LED forward bias & current, button/switch closures, potentiometer dividers, and sensor outputs.
 */
export function solveElectricalCircuit(
  components: PlacedComponent[],
  wires: WireConnection[],
  mcuState: McuOutputState,
  isSimulationRunning: boolean
): CircuitSolverResult {
  const pinStates: Record<string, PinElectricalState> = {}
  const componentStates: Record<string, ComponentRuntimeState> = {}
  const warnings: ElectricalWarning[] = []
  const mcuPinInputs: Record<string, { digital: 0 | 1; analogAdc: number; voltage: number }> = {}

  // 1. Collect all pins and initialize Union-Find for electrical nets
  const parent: Record<string, string> = {}
  const find = (x: string): string => {
    if (!parent[x]) parent[x] = x
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }

  for (const comp of components) {
    const cat = getCatalogItem(comp.type)
    if (!cat) continue
    for (const pin of cat.pins) {
      const key = `${comp.id}:${pin.id}`
      parent[key] = key
    }

    // Internal common ground / rail ties inside components
    if (
      comp.type === "arduino_uno" ||
      comp.type === "arduino_nano" ||
      comp.type === "arduino_mega" ||
      comp.type === "esp32_devkit" ||
      comp.type === "esp8266_nodemcu"
    ) {
      const gndPins = cat.pins.filter((p) => p.type === "ground")
      for (let i = 1; i < gndPins.length; i++) {
        union(`${comp.id}:${gndPins[0].id}`, `${comp.id}:${gndPins[i].id}`)
      }
    } else if (comp.type === "breadboard_small") {
      union(`${comp.id}:VCC_L`, `${comp.id}:VCC_R`)
      union(`${comp.id}:GND_L`, `${comp.id}:GND_R`)
      for (let col = 1; col <= 5; col++) {
        union(`${comp.id}:C${col}_A`, `${comp.id}:C${col}_B`)
      }
    } else if (comp.type === "pushbutton" && Boolean(comp.properties.pressed)) {
      union(`${comp.id}:P1`, `${comp.id}:P2`)
    } else if (comp.type === "spst_switch" && Boolean(comp.properties.closed)) {
      union(`${comp.id}:P1`, `${comp.id}:P2`)
    }
  }

  // 2. Union all explicitly wired pins
  for (const w of wires) {
    const k1 = `${w.fromComponentId}:${w.fromPinId}`
    const k2 = `${w.toComponentId}:${w.toPinId}`
    union(k1, k2)
  }

  // 3. Track direct voltage drivers on each net: { voltage, impedance, sourceDesc }
  interface NetDriver {
    voltage: number
    impedance: number // 0 = stiff rail/MCU output, >0 = pullup or resistor-coupled
    sourceId: string
    pwmDuty?: number
  }
  const netDrivers: Record<string, NetDriver[]> = {}
  const addDriver = (netId: string, driver: NetDriver) => {
    if (!netDrivers[netId]) netDrivers[netId] = []
    netDrivers[netId].push(driver)
  }

  const mcuComp = components.find((c) =>
    ["arduino_uno", "arduino_nano", "arduino_mega", "esp32_devkit", "esp8266_nodemcu"].includes(c.type)
  )
  const mcuLogicVoltage =
    mcuComp && (mcuComp.type === "esp32_devkit" || mcuComp.type === "esp8266_nodemcu") ? 3.3 : 5.0

  // Add fixed power/ground and MCU output drivers
  for (const comp of components) {
    if (comp.type === "gnd") {
      const net = find(`${comp.id}:GND`)
      addDriver(net, { voltage: 0, impedance: 0, sourceId: `${comp.designator} (GND)` })
    } else if (comp.type === "vcc_5v") {
      const v = Number(comp.properties.voltage ?? 5.0)
      const net = find(`${comp.id}:VCC`)
      addDriver(net, { voltage: v, impedance: 0, sourceId: `${comp.designator} (+${v}V)` })
    } else if (
      comp.type === "arduino_uno" ||
      comp.type === "arduino_nano" ||
      comp.type === "arduino_mega" ||
      comp.type === "esp32_devkit" ||
      comp.type === "esp8266_nodemcu"
    ) {
      const cat = getCatalogItem(comp.type)
      if (!cat) continue
      for (const pin of cat.pins) {
        const net = find(`${comp.id}:${pin.id}`)
        if (pin.type === "ground") {
          addDriver(net, { voltage: 0, impedance: 0, sourceId: `${comp.designator}.${pin.id}` })
        } else if (pin.id === "5V" || pin.id === "VIN") {
          addDriver(net, { voltage: 5.0, impedance: 0, sourceId: `${comp.designator}.5V` })
        } else if (pin.id === "3V3") {
          addDriver(net, { voltage: 3.3, impedance: 0, sourceId: `${comp.designator}.3.3V` })
        } else if (isSimulationRunning) {
          const mode = mcuState.pinModes[pin.id] || "INPUT"
          if (mode === "OUTPUT") {
            const pwm = mcuState.pwmOutputs[pin.id]
            if (pwm !== undefined && pwm >= 0) {
              const effV = (pwm / 255) * mcuLogicVoltage
              addDriver(net, {
                voltage: effV,
                impedance: 25, // internal AVR pin output impedance ~25 ohm
                sourceId: `${comp.designator}.${pin.id} (PWM)`,
                pwmDuty: pwm,
              })
            } else {
              const dig = mcuState.digitalOutputs[pin.id] ?? 0
              addDriver(net, {
                voltage: dig ? mcuLogicVoltage : 0,
                impedance: 25,
                sourceId: `${comp.designator}.${pin.id} (${dig ? "HIGH" : "LOW"})`,
                pwmDuty: dig ? 255 : 0,
              })
            }
          } else if (mode === "INPUT_PULLUP") {
            addDriver(net, {
              voltage: mcuLogicVoltage,
              impedance: 35000, // 35k internal pullup
              sourceId: `${comp.designator}.${pin.id} (PULLUP)`,
            })
          }
        }
      }
    }
  }

  // Add sensor and potentiometer output drivers
  for (const comp of components) {
    if (comp.type === "potentiometer") {
      const pos = Math.max(0, Math.min(100, Number(comp.properties.position ?? 50))) / 100
      const totalR = Math.max(100, Number(comp.properties.resistance ?? 10000))
      const wiperNet = find(`${comp.id}:WIPER`)
      const vOut = pos * 5.0
      const rEq = Math.max(50, pos * (1 - pos) * totalR)
      addDriver(wiperNet, {
        voltage: vOut,
        impedance: rEq,
        sourceId: `${comp.designator}.WIPER`,
      })
    } else if (comp.type === "ldr_sensor") {
      const lux = Math.max(0, Math.min(100, Number(comp.properties.luxLevel ?? 65))) / 100
      addDriver(find(`${comp.id}:AO`), {
        voltage: lux * 5.0,
        impedance: 1000,
        sourceId: `${comp.designator}.AO`,
      })
      addDriver(find(`${comp.id}:DO`), {
        voltage: lux >= 0.5 ? 5.0 : 0.0,
        impedance: 100,
        sourceId: `${comp.designator}.DO`,
      })
    } else if (comp.type === "pir_sensor") {
      const motion = Boolean(comp.properties.motionDetected)
      addDriver(find(`${comp.id}:OUT`), {
        voltage: motion ? 5.0 : 0.0,
        impedance: 100,
        sourceId: `${comp.designator}.OUT`,
      })
    } else if (comp.type === "tmp36") {
      const tempC = Number(comp.properties.temperatureC ?? 25)
      const vOut = Math.max(0, Math.min(5.0, 0.5 + tempC * 0.01))
      addDriver(find(`${comp.id}:VOUT`), {
        voltage: vOut,
        impedance: 100,
        sourceId: `${comp.designator}.VOUT`,
      })
    } else if (comp.type === "ir_sensor") {
      const obs = Boolean(comp.properties.obstaclePresent)
      addDriver(find(`${comp.id}:OUT`), {
        voltage: obs ? 0.0 : 5.0,
        impedance: 100,
        sourceId: `${comp.designator}.OUT`,
      })
    } else if (comp.type === "soil_moisture") {
      const pct = Math.max(0, Math.min(100, Number(comp.properties.moisturePct ?? 45))) / 100
      addDriver(find(`${comp.id}:AO`), {
        voltage: pct * 5.0,
        impedance: 1000,
        sourceId: `${comp.designator}.AO`,
      })
    } else if (comp.type === "gas_mq2") {
      const ppm = Math.max(100, Math.min(5000, Number(comp.properties.gasPpm ?? 250)))
      const vOut = (ppm / 5000) * 5.0
      addDriver(find(`${comp.id}:AO`), {
        voltage: vOut,
        impedance: 1000,
        sourceId: `${comp.designator}.AO`,
      })
      addDriver(find(`${comp.id}:DO`), {
        voltage: ppm > 1000 ? 5.0 : 0.0,
        impedance: 100,
        sourceId: `${comp.designator}.DO`,
      })
    }
  }

  // 4. Detect direct stiff short circuits (e.g. 5V directly wired to GND)
  for (const [netId, drivers] of Object.entries(netDrivers)) {
    const stiffDrivers = drivers.filter((d) => d.impedance <= 30)
    if (stiffDrivers.length >= 2) {
      const minV = Math.min(...stiffDrivers.map((d) => d.voltage))
      const maxV = Math.max(...stiffDrivers.map((d) => d.voltage))
      if (maxV - minV > 1.0) {
        warnings.push({
          id: `short_${netId}`,
          severity: "error",
          message: `Short circuit detected between ${stiffDrivers[0].sourceId} (${stiffDrivers[0].voltage.toFixed(1)}V) and ${stiffDrivers[1].sourceId} (${stiffDrivers[1].voltage.toFixed(1)}V)!`,
          netId,
        })
      }
    }
  }

  // Helper to compute direct net Thévenin equivalent (before resistor propagation)
  const getDirectNetThevenin = (netId: string): { voltage: number; resistance: number; driven: boolean } => {
    const drivers = netDrivers[netId]
    if (!drivers || drivers.length === 0) {
      return { voltage: 0, resistance: Infinity, driven: false }
    }
    // Check if there are stiff zero-impedance rails
    const zeroImp = drivers.filter((d) => d.impedance === 0)
    if (zeroImp.length > 0) {
      const avgV = zeroImp.reduce((s, d) => s + d.voltage, 0) / zeroImp.length
      return { voltage: avgV, resistance: 0, driven: true }
    }
    // Millman's theorem across drivers with finite impedance
    let sumG = 0
    let sumI = 0
    for (const d of drivers) {
      const g = 1 / Math.max(1, d.impedance)
      sumG += g
      sumI += d.voltage * g
    }
    return {
      voltage: sumG > 0 ? sumI / sumG : 0,
      resistance: sumG > 0 ? 1 / sumG : Infinity,
      driven: sumG > 0,
    }
  }

  // 5. Propagate Thévenin equivalents across passive Resistors (up to 3 hops)
  const netThevenin: Record<string, { voltage: number; resistance: number; driven: boolean }> = {}
  for (const key of Object.keys(parent)) {
    const net = find(key)
    if (!netThevenin[net]) {
      netThevenin[net] = getDirectNetThevenin(net)
    }
  }

  const resistors = components.filter((c) => c.type === "resistor")
  for (let pass = 0; pass < 3; pass++) {
    for (const rComp of resistors) {
      const rVal = Math.max(1, Number(rComp.properties.resistance ?? 220))
      const n1 = find(`${rComp.id}:P1`)
      const n2 = find(`${rComp.id}:P2`)
      const t1 = netThevenin[n1] || { voltage: 0, resistance: Infinity, driven: false }
      const t2 = netThevenin[n2] || { voltage: 0, resistance: Infinity, driven: false }

      if (t1.driven && !t2.driven) {
        netThevenin[n2] = {
          voltage: t1.voltage,
          resistance: t1.resistance + rVal,
          driven: true,
        }
      } else if (t2.driven && !t1.driven) {
        netThevenin[n1] = {
          voltage: t2.voltage,
          resistance: t2.resistance + rVal,
          driven: true,
        }
      } else if (t1.driven && t2.driven) {
        // Voltage divider between n1 and n2
        const iFlow = (t1.voltage - t2.voltage) / (t1.resistance + rVal + t2.resistance)
        componentStates[rComp.id] = {
          currentMa: Math.abs(iFlow * 1000),
          voltageDrop: Math.abs(iFlow * rVal),
        }
      }
    }
  }

  // 6. Evaluate LEDs, RGB LEDs, Buzzers, Motors, Relays, 7-Segment, LCD, Multimeters
  for (const comp of components) {
    if (comp.type === "led") {
      const anodeNet = find(`${comp.id}:ANODE`)
      const cathodeNet = find(`${comp.id}:CATHODE`)
      const tA = netThevenin[anodeNet]
      const tK = netThevenin[cathodeNet]
      const vf = Number(comp.properties.forwardVoltage ?? 2.0)

      if (tA?.driven && tK?.driven && tA.voltage - tK.voltage > vf) {
        const totalR = tA.resistance + tK.resistance
        const vDiff = tA.voltage - tK.voltage - vf
        const effectiveR = Math.max(25, totalR)
        const currentMa = (vDiff / effectiveR) * 1000
        const brightness = Math.min(1, Math.max(0.15, currentMa / 15))

        let warning: string | undefined
        if (totalR < 40) {
          warning = `High LED current (${currentMa.toFixed(0)} mA) on ${comp.designator}. Use a 220Ω–1kΩ series resistor.`
          warnings.push({
            id: `led_overcurrent_${comp.id}`,
            severity: "warning",
            message: warning,
            componentIds: [comp.id],
          })
        }

        componentStates[comp.id] = {
          brightness,
          currentMa: Number(currentMa.toFixed(2)),
          voltageDrop: vf,
          warning,
        }

        // Also update the series resistor's current state if connected
        for (const rComp of resistors) {
          const rn1 = find(`${rComp.id}:P1`)
          const rn2 = find(`${rComp.id}:P2`)
          if (rn1 === anodeNet || rn2 === anodeNet || rn1 === cathodeNet || rn2 === cathodeNet) {
            const rVal = Number(rComp.properties.resistance ?? 220)
            componentStates[rComp.id] = {
              currentMa: Number(currentMa.toFixed(2)),
              voltageDrop: Number(((currentMa / 1000) * rVal).toFixed(2)),
            }
          }
        }
      } else {
        componentStates[comp.id] = {
          brightness: 0,
          currentMa: 0,
          voltageDrop: 0,
        }
      }
    } else if (comp.type === "rgb_led") {
      const kNet = find(`${comp.id}:CATHODE`)
      const tK = netThevenin[kNet]
      const calcChannel = (pinId: string) => {
        const net = find(`${comp.id}:${pinId}`)
        const t = netThevenin[net]
        if (t?.driven && tK?.driven && t.voltage - tK.voltage > 1.8) {
          return Math.min(255, Math.round(((t.voltage - tK.voltage) / 3.2) * 255))
        }
        return 0
      }
      const r = calcChannel("R")
      const g = calcChannel("G")
      const b = calcChannel("B")
      componentStates[comp.id] = {
        rgbColor: { r, g, b },
        brightness: Math.max(r, g, b) / 255,
      }
    } else if (comp.type === "buzzer") {
      const pNet = find(`${comp.id}:POS`)
      const nNet = find(`${comp.id}:NEG`)
      const tP = netThevenin[pNet]
      const tN = netThevenin[nNet]
      let activeFreq = 0
      if (tP?.driven && tN?.driven && tP.voltage - tN.voltage > 2.0) {
        activeFreq = Number(comp.properties.resonantFreqHz ?? 2000)
      }
      // Check if connected to a tone() pin
      if (mcuComp) {
        for (const [pinId, freq] of Object.entries(mcuState.toneFrequencies)) {
          if (freq > 0 && find(`${mcuComp.id}:${pinId}`) === pNet) {
            activeFreq = freq
          }
        }
      }
      componentStates[comp.id] = {
        frequency: activeFreq,
        brightness: activeFreq > 0 ? 1 : 0,
      }
    } else if (comp.type === "servo_motor") {
      const pwmNet = find(`${comp.id}:PWM`)
      let angle = Number(comp.properties.defaultAngle ?? 90)
      if (mcuComp && isSimulationRunning) {
        const cat = getCatalogItem(mcuComp.type)
        for (const pin of cat?.pins || []) {
          if (find(`${mcuComp.id}:${pin.id}`) === pwmNet) {
            if (mcuState.servoAngles[pin.id] !== undefined) {
              angle = mcuState.servoAngles[pin.id]
            } else if (mcuState.pwmOutputs[pin.id] !== undefined) {
              angle = Math.round((mcuState.pwmOutputs[pin.id] / 255) * 180)
            } else if (mcuState.digitalOutputs[pin.id] !== undefined) {
              angle = mcuState.digitalOutputs[pin.id] ? 180 : 0
            }
          }
        }
      }
      componentStates[comp.id] = { angle }
    } else if (comp.type === "dc_motor") {
      const t1 = netThevenin[find(`${comp.id}:TERM1`)]
      const t2 = netThevenin[find(`${comp.id}:TERM2`)]
      let rpm = 0
      if (t1?.driven && t2?.driven) {
        const vDiff = t1.voltage - t2.voltage
        const maxRpm = Number(comp.properties.maxRpm ?? 3000)
        rpm = Math.round((vDiff / 5.0) * maxRpm)
      }
      componentStates[comp.id] = { rpm }
    } else if (comp.type === "lcd_16x2" || comp.type === "oled_128x64") {
      componentStates[comp.id] = {
        lcdLines: mcuState.lcdState.lines,
        lcdBacklight: mcuState.lcdState.backlight,
      }
    } else if (comp.type === "seven_segment") {
      const comNet = find(`${comp.id}:COM`)
      const tCom = netThevenin[comNet]
      const segs: Record<string, boolean> = {}
      for (const s of ["A", "B", "C", "D", "E", "F", "G", "DP"]) {
        const tSeg = netThevenin[find(`${comp.id}:${s}`)]
        segs[s] = Boolean(tSeg?.driven && tCom?.driven && tSeg.voltage - tCom.voltage > 1.8)
      }
      componentStates[comp.id] = { segments: segs }
    } else if (comp.type === "relay_module") {
      const tIn = netThevenin[find(`${comp.id}:IN`)]
      const energized = Boolean(tIn?.driven && tIn.voltage > 2.5)
      componentStates[comp.id] = { relayClosed: energized }
    } else if (comp.type === "multimeter") {
      const tPos = netThevenin[find(`${comp.id}:VPOS`)]
      const tCom = netThevenin[find(`${comp.id}:VCOM`)]
      const vMeasured = (tPos?.driven ? tPos.voltage : 0) - (tCom?.driven ? tCom.voltage : 0)
      componentStates[comp.id] = { measuredVoltage: Number(vMeasured.toFixed(2)) }
    }
  }

  // 7. Populate pinStates and MCU input readings
  for (const comp of components) {
    const cat = getCatalogItem(comp.type)
    if (!cat) continue
    for (const pin of cat.pins) {
      const key = `${comp.id}:${pin.id}`
      const net = find(key)
      const th = netThevenin[net] || { voltage: 0, resistance: Infinity, driven: false }
      const voltage = th.driven ? Number(th.voltage.toFixed(2)) : 0
      const digitalValue: 0 | 1 = voltage >= mcuLogicVoltage * 0.5 ? 1 : 0
      const mode = (comp.id === mcuComp?.id && mcuState.pinModes[pin.id]) || "INPUT"
      const pwmValue = (comp.id === mcuComp?.id && mcuState.pwmOutputs[pin.id]) || (digitalValue ? 255 : 0)

      pinStates[key] = {
        voltage,
        mode,
        digitalValue,
        pwmValue,
        netId: net,
      }

      if (comp.id === mcuComp?.id) {
        const adcMax = comp.type === "esp32_devkit" ? 4095 : 1023
        const analogAdc = Math.max(
          0,
          Math.min(adcMax, Math.round((voltage / mcuLogicVoltage) * adcMax))
        )
        mcuPinInputs[pin.id] = {
          digital: digitalValue,
          analogAdc,
          voltage,
        }
      }
    }
  }

  // Also check if Arduino's built-in D13 LED is active
  if (mcuComp) {
    const d13State = pinStates[`${mcuComp.id}:D13`]
    componentStates[mcuComp.id] = {
      brightness: d13State && d13State.voltage > 2.0 ? 1 : 0,
    }
  }

  return {
    pinStates,
    componentStates,
    warnings,
    mcuPinInputs,
  }
}

