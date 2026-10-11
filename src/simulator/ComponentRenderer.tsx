import React from "react"
import { getCatalogItem } from "./componentLibrary"
import type {
  PlacedComponent,
  ComponentRuntimeState,
  PinElectricalState,
} from "./types"

interface ComponentRendererProps {
  component: PlacedComponent
  runtimeState?: ComponentRuntimeState
  pinStates: Record<string, PinElectricalState>
  isSelected: boolean
  isSimulationRunning: boolean
  onToggleInteractive?: (componentId: string, key: string, nextValue: any) => void
}

const LED_COLOR_MAP: Record<string, { off: string; on: string; glow: string }> = {
  yellow: { off: "#451a03", on: "#facc15", glow: "rgba(250, 204, 21, 0.75)" },
  red: { off: "#450a0a", on: "#ef4444", glow: "rgba(239, 68, 68, 0.75)" },
  green: { off: "#052e16", on: "#22c55e", glow: "rgba(34, 197, 94, 0.75)" },
  blue: { off: "#172554", on: "#3b82f6", glow: "rgba(59, 130, 246, 0.75)" },
  white: { off: "#334155", on: "#f8fafc", glow: "rgba(248, 250, 252, 0.85)" },
}

export default function ComponentRenderer({
  component,
  runtimeState,
  isSimulationRunning,
  onToggleInteractive,
}: ComponentRendererProps) {
  const catalog = getCatalogItem(component.type)
  if (!catalog) return null

  const { type, designator, properties } = component
  const brightness = runtimeState?.brightness ?? 0
  const isLit = isSimulationRunning && brightness > 0.05

  // --------------------------------------------------------------------------
  // 1. ARDUINO UNO R3 (Proteus SIMULINO UNO + Realistic Board Markings)
  // --------------------------------------------------------------------------
  if (type === "arduino_uno") {
    const d13Lit = isLit
    return (
      <g>
        {/* Top & Bottom Red Pin Leads (Proteus style) */}
        {catalog.pins.map((pin) => {
          if (pin.leadDirection === "top") {
            return (
              <g key={pin.id}>
                <line
                  x1={pin.x}
                  y1={0}
                  x2={pin.x}
                  y2={28}
                  stroke="#991b1b"
                  strokeWidth={2}
                />
                <text
                  x={pin.x - 3}
                  y={18}
                  fontSize={9}
                  fontFamily="monospace"
                  fill="#1e293b"
                  transform={`rotate(-90, ${pin.x - 3}, 18)`}
                >
                  {pin.label.replace(/^~/, "")}
                </text>
              </g>
            )
          }
          if (pin.leadDirection === "bottom") {
            return (
              <g key={pin.id}>
                <line
                  x1={pin.x}
                  y1={212}
                  x2={pin.x}
                  y2={240}
                  stroke="#991b1b"
                  strokeWidth={2}
                />
                <text
                  x={pin.x - 3}
                  y={236}
                  fontSize={9}
                  fontFamily="monospace"
                  fill="#1e293b"
                  transform={`rotate(-90, ${pin.x - 3}, 236)`}
                >
                  {pin.label}
                </text>
              </g>
            )
          }
          return null
        })}

        {/* Main Blue Arduino Uno PCB Body */}
        <rect
          x={20}
          y={28}
          width={308}
          height={184}
          rx={6}
          fill="#0066cc"
          stroke="#002b5c"
          strokeWidth={2}
        />

        {/* Mounting Holes */}
        <circle cx={46} cy={40} r={5} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />
        <circle cx={314} cy={52} r={5} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />
        <circle cx={314} cy={196} r={5} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />
        <circle cx={68} cy={198} r={5} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />

        {/* Silver USB Type-B Connector (Top-Left) */}
        <rect
          x={6}
          y={48}
          width={40}
          height={36}
          rx={2}
          fill="#94a3b8"
          stroke="#334155"
          strokeWidth={1.5}
        />
        <rect x={12} y={54} width={28} height={24} fill="#cbd5e1" stroke="#64748b" strokeWidth={1} />

        {/* Black DC Power Barrel Jack (Bottom-Left) */}
        <rect
          x={6}
          y={162}
          width={46}
          height={32}
          rx={2}
          fill="#0f172a"
          stroke="#000000"
          strokeWidth={1.5}
        />
        <rect x={22} y={166} width={28} height={24} fill="#1e293b" />

        {/* Top Pin Header Black Plastic Strips */}
        <rect x={52} y={32} width={128} height={12} fill="#0f172a" stroke="#000" />
        <rect x={196} y={32} width={128} height={12} fill="#0f172a" stroke="#000" />
        {catalog.pins
          .filter((p) => p.leadDirection === "top")
          .map((pin) => (
            <g key={`hdr_${pin.id}`}>
              <rect
                x={pin.x - 3}
                y={35}
                width={6}
                height={6}
                fill="#d97706"
                stroke="#000"
                strokeWidth={0.6}
              />
              <text
                x={pin.x + 3}
                y={58}
                fontSize={8.5}
                fontWeight="bold"
                fontFamily="monospace"
                fill="#ffffff"
                transform={`rotate(-90, ${pin.x + 3}, 58)`}
              >
                {pin.label}
              </text>
            </g>
          ))}

        {/* Top DIGITAL (PWM~) Bracket & Label */}
        <path
          d="M 88 74 L 88 78 L 318 78 L 318 74"
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.2}
        />
        <text
          x={224}
          y={74}
          fontSize={8.5}
          fontWeight="bold"
          fontFamily="sans-serif"
          fill="#ffffff"
        >
          DIGITAL (PWM~)
        </text>

        {/* Built-in L (D13) and ON LEDs on the Arduino Board */}
        <g>
          <circle
            cx={118}
            cy={96}
            r={4.5}
            fill={d13Lit ? "#facc15" : "#475569"}
            stroke="#0f172a"
            strokeWidth={1}
          />
          {d13Lit && (
            <circle cx={118} cy={96} r={9} fill="rgba(250, 204, 21, 0.45)" />
          )}
          <text x={126} y={99} fontSize={8} fontWeight="bold" fill="#ffffff">
            L (D13)
          </text>

          <circle
            cx={286}
            cy={96}
            r={4}
            fill={isSimulationRunning ? "#22c55e" : "#14532d"}
            stroke="#0f172a"
            strokeWidth={1}
          />
          <text x={294} y={99} fontSize={8} fontWeight="bold" fill="#ffffff">
            ON
          </text>
        </g>

        {/* Arduino Infinity Logo & SIMULINO Pill */}
        <g transform="translate(105, 102)">
          <circle cx={12} cy={10} r={8.5} fill="none" stroke="#ffffff" strokeWidth={2.5} />
          <circle cx={28} cy={10} r={8.5} fill="none" stroke="#ffffff" strokeWidth={2.5} />
          <text x={9} y={13} fontSize={10} fontWeight="bold" fill="#ffffff">
            -
          </text>
          <text x={24.5} y={13.5} fontSize={10} fontWeight="bold" fill="#ffffff">
            +
          </text>
          <text x={3} y={26} fontSize={7.5} fontWeight="bold" fill="#ffffff" letterSpacing={0.5}>
            ARDUINO
          </text>
        </g>

        <rect
          x={156}
          y={101}
          width={98}
          height={20}
          rx={10}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.2}
          strokeDasharray="2 1"
        />
        <text
          x={205}
          y={115}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fontFamily="sans-serif"
          fill="#ffffff"
          letterSpacing={1}
        >
          {String(properties.model || "SIMULINO").slice(0, 10)}
        </text>

        {/* ATmega328P 28-Pin DIP IC Socket */}
        <g transform="translate(106, 134)">
          <rect
            x={0}
            y={0}
            width={186}
            height={34}
            rx={2}
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth={1.5}
          />
          {/* IC Notch */}
          <path d="M 186 12 A 5 5 0 0 0 186 22" fill="#0f172a" />
          {/* IC Pins */}
          {Array.from({ length: 14 }).map((_, idx) => (
            <g key={idx}>
              <circle cx={10 + idx * 12.8} cy={4} r={2.5} fill="#0f172a" />
              <circle cx={10 + idx * 12.8} cy={30} r={2.5} fill="#0f172a" />
            </g>
          ))}
          <text
            x={93}
            y={15}
            textAnchor="middle"
            fontSize={6.5}
            fontFamily="monospace"
            fill="#eab308"
          >
            ATMEL ATMEGA328P-PU
          </text>
          <text
            x={93}
            y={24}
            textAnchor="middle"
            fontSize={6}
            fontFamily="monospace"
            fill="#94a3b8"
          >
            16MHz AVR MICROCONTROLLER
          </text>
        </g>

        {/* Bottom POWER & ANALOG IN Labels and Header Strips */}
        <text x={156} y={184} fontSize={8} fontWeight="bold" fill="#ffffff">
          POWER
        </text>
        <text x={250} y={184} fontSize={8} fontWeight="bold" fill="#ffffff">
          ANALOG IN
        </text>

        <rect x={108} y={198} width={96} height={12} fill="#0f172a" stroke="#000" />
        <rect x={228} y={198} width={96} height={12} fill="#0f172a" stroke="#000" />
        {catalog.pins
          .filter((p) => p.leadDirection === "bottom")
          .map((pin) => (
            <g key={`bhdr_${pin.id}`}>
              <rect
                x={pin.x - 3}
                y={201}
                width={6}
                height={6}
                fill="#d97706"
                stroke="#000"
                strokeWidth={0.6}
              />
              <text
                x={pin.x + 3}
                y={195}
                fontSize={7.5}
                fontWeight="bold"
                fontFamily="monospace"
                fill="#ffffff"
                transform={`rotate(-90, ${pin.x + 3}, 195)`}
              >
                {pin.label}
              </text>
            </g>
          ))}

        {/* External Designator Label (Right of Board, Proteus Style) */}
        <text x={336} y={48} fontSize={13} fontWeight="bold" fontFamily="sans-serif" fill="#0f172a">
          {designator}
        </text>
        <text x={336} y={62} fontSize={10} fontFamily="sans-serif" fill="#334155">
          {properties.model || "SIMULINO UNO"}
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 2. RESISTOR (Proteus Schematic Brick + Value Label)
  // --------------------------------------------------------------------------
  if (type === "resistor") {
    const ohms = Number(properties.resistance ?? 220)
    const formattedOhms =
      ohms >= 1000000
        ? `${(ohms / 1000000).toFixed(1)}M`
        : ohms >= 1000
        ? `${(ohms / 1000).toFixed(1)}k`
        : `${ohms}`
    return (
      <g>
        {/* Left & Right Pin Leads */}
        <line x1={0} y1={20} x2={24} y2={20} stroke="#991b1b" strokeWidth={2.2} />
        <line x1={76} y1={20} x2={100} y2={20} stroke="#991b1b" strokeWidth={2.2} />

        {/* Proteus Schematic Resistor Rectangle */}
        <rect
          x={24}
          y={12}
          width={52}
          height={16}
          fill="#ede9fe"
          stroke="#7f1d1d"
          strokeWidth={2}
        />

        {/* Subtle Color Bands */}
        <line x1={34} y1={13} x2={34} y2={27} stroke="#dc2626" strokeWidth={2.5} />
        <line x1={43} y1={13} x2={43} y2={27} stroke="#dc2626" strokeWidth={2.5} />
        <line x1={52} y1={13} x2={52} y2={27} stroke="#78350f" strokeWidth={2.5} />
        <line x1={65} y1={13} x2={65} y2={27} stroke="#ca8a04" strokeWidth={2} />

        {/* Designator above, Resistance below */}
        <text x={24} y={8} fontSize={12} fontWeight="bold" fontFamily="sans-serif" fill="#0f172a">
          {designator}
        </text>
        <text x={24} y={40} fontSize={10.5} fontFamily="sans-serif" fill="#1e293b">
          {formattedOhms}Ω
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 3. LED (Proteus Circular Diode + Animated Glow When Lit)
  // --------------------------------------------------------------------------
  if (type === "led") {
    const colorKey = String(properties.color || "yellow").toLowerCase()
    const palette = LED_COLOR_MAP[colorKey] || LED_COLOR_MAP.yellow

    return (
      <g>
        {/* Outer Glow Halo when Forward-Biased */}
        {isLit && (
          <circle
            cx={30}
            cy={40}
            r={30}
            fill={palette.glow}
            style={{ filter: "blur(6px)" }}
          />
        )}

        {/* Top Anode & Bottom Cathode Leads */}
        <line x1={30} y1={0} x2={30} y2={22} stroke="#991b1b" strokeWidth={2.2} />
        <line x1={30} y1={58} x2={30} y2={80} stroke="#991b1b" strokeWidth={2.2} />

        {/* Proteus Circular LED Body */}
        <circle
          cx={30}
          cy={40}
          r={18}
          fill={isLit ? palette.on : palette.off}
          stroke="#991b1b"
          strokeWidth={2.2}
        />

        {/* Diode Triangle & Cathode Bar Inside Circle */}
        <polygon
          points="21,31 39,31 30,48"
          fill={isLit ? "#ffffff" : "#dc2626"}
          stroke="#7f1d1d"
          strokeWidth={1.2}
        />
        <line x1={20} y1={49} x2={40} y2={49} stroke={isLit ? "#ffffff" : "#dc2626"} strokeWidth={2.2} />

        {/* Light Emission Arrows */}
        <path d="M 10 38 L 2 44 M 2 44 L 6 44 M 2 44 L 2 40" stroke="#991b1b" strokeWidth={1.3} fill="none" />
        <path d="M 12 46 L 4 52 M 4 52 L 8 52 M 4 52 L 4 48" stroke="#991b1b" strokeWidth={1.3} fill="none" />

        {/* Designator & Label (Right of LED) */}
        <text x={54} y={36} fontSize={12} fontWeight="bold" fontFamily="sans-serif" fill="#0f172a">
          {designator}
        </text>
        <text x={54} y={50} fontSize={10} fontFamily="sans-serif" fill="#334155">
          LED-{colorKey.toUpperCase()}
        </text>
        {isLit && runtimeState?.currentMa !== undefined && (
          <text x={54} y={63} fontSize={9.5} fontWeight="bold" fontFamily="monospace" fill="#15803d">
            {runtimeState.currentMa.toFixed(1)} mA (ON)
          </text>
        )}
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 4. GROUND TERMINAL (Proteus 3-Line Ground Symbol)
  // --------------------------------------------------------------------------
  if (type === "gnd") {
    return (
      <g>
        <line x1={20} y1={0} x2={20} y2={18} stroke="#14532d" strokeWidth={2.2} />
        <line x1={4} y1={18} x2={36} y2={18} stroke="#14532d" strokeWidth={2.5} />
        <line x1={10} y1={25} x2={30} y2={25} stroke="#14532d" strokeWidth={2.2} />
        <line x1={15} y1={32} x2={25} y2={32} stroke="#14532d" strokeWidth={2.2} />
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 5. +5V POWER RAIL TERMINAL
  // --------------------------------------------------------------------------
  if (type === "vcc_5v") {
    const v = Number(properties.voltage ?? 5.0)
    return (
      <g>
        <line x1={20} y1={18} x2={20} y2={44} stroke="#991b1b" strokeWidth={2.2} />
        <polygon points="20,4 10,18 30,18" fill="#dc2626" stroke="#7f1d1d" strokeWidth={1.5} />
        <text x={20} y={-2} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#991b1b">
          +{v}V
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 6. PUSH BUTTON (Interactive Clickable Tactile Switch)
  // --------------------------------------------------------------------------
  if (type === "pushbutton") {
    const pressed = Boolean(properties.pressed)
    return (
      <g
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleInteractive?.(component.id, "pressed", !pressed)
        }}
      >
        <line x1={0} y1={30} x2={22} y2={30} stroke="#991b1b" strokeWidth={2.2} />
        <line x1={58} y1={30} x2={80} y2={30} stroke="#991b1b" strokeWidth={2.2} />
        <rect
          x={18}
          y={10}
          width={44}
          height={40}
          rx={6}
          fill="#334155"
          stroke="#0f172a"
          strokeWidth={2}
        />
        <circle
          cx={40}
          cy={30}
          r={12}
          fill={pressed ? "#22c55e" : "#ef4444"}
          stroke="#0f172a"
          strokeWidth={1.5}
        />
        <text x={40} y={6} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator} ({pressed ? "PRESSED" : "OPEN"})
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 7. TOGGLE SWITCH (SPST)
  // --------------------------------------------------------------------------
  if (type === "spst_switch") {
    const closed = Boolean(properties.closed)
    return (
      <g
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleInteractive?.(component.id, "closed", !closed)
        }}
      >
        <line x1={0} y1={25} x2={24} y2={25} stroke="#991b1b" strokeWidth={2.2} />
        <line x1={56} y1={25} x2={80} y2={25} stroke="#991b1b" strokeWidth={2.2} />
        <circle cx={24} cy={25} r={3.5} fill="#ffffff" stroke="#0f172a" strokeWidth={1.5} />
        <circle cx={56} cy={25} r={3.5} fill="#ffffff" stroke="#0f172a" strokeWidth={1.5} />
        <line
          x1={24}
          y1={25}
          x2={54}
          y2={closed ? 25 : 10}
          stroke={closed ? "#16a34a" : "#dc2626"}
          strokeWidth={2.5}
        />
        <text x={40} y={44} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator} ({closed ? "ON" : "OFF"})
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 8. POTENTIOMETER (Rotary Knob + Live Wiper Percentage)
  // --------------------------------------------------------------------------
  if (type === "potentiometer") {
    const pos = Number(properties.position ?? 50)
    const angleDeg = -135 + (pos / 100) * 270
    return (
      <g>
        {catalog.pins.map((p) => (
          <line key={p.id} x1={p.x} y1={72} x2={p.x} y2={90} stroke="#991b1b" strokeWidth={2} />
        ))}
        <rect x={14} y={12} width={62} height={60} rx={8} fill="#1e293b" stroke="#0f172a" strokeWidth={2} />
        <circle cx={45} cy={40} r={20} fill="#475569" stroke="#cbd5e1" strokeWidth={2} />
        <g transform={`rotate(${angleDeg}, 45, 40)`}>
          <line x1={45} y1={40} x2={45} y2={22} stroke="#facc15" strokeWidth={3} strokeLinecap="round" />
        </g>
        <text x={45} y={9} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator} ({pos}%)
        </text>
        <text x={20} y={68} textAnchor="middle" fontSize={7.5} fill="#fca5a5">
          +
        </text>
        <text x={45} y={68} textAnchor="middle" fontSize={7.5} fill="#fde047">
          W
        </text>
        <text x={70} y={68} textAnchor="middle" fontSize={7.5} fill="#94a3b8">
          -
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 9. LCD 16x2 CHARACTER DISPLAY
  // --------------------------------------------------------------------------
  if (type === "lcd_16x2") {
    const lines = runtimeState?.lcdLines || ["SkilTrix LCD16x2", "Ready...        "]
    const isBlue = properties.backlightColor === "blue"
    return (
      <g>
        {catalog.pins.map((p) => (
          <g key={p.id}>
            <line x1={p.x} y1={94} x2={p.x} y2={110} stroke="#991b1b" strokeWidth={2} />
            <text x={p.x} y={91} textAnchor="middle" fontSize={6.5} fontFamily="monospace" fill="#e2e8f0">
              {p.label}
            </text>
          </g>
        ))}
        <rect x={6} y={8} width={228} height={86} rx={5} fill="#15803d" stroke="#052e16" strokeWidth={2} />
        <rect x={16} y={18} width={208} height={56} rx={3} fill="#0f172a" />
        <rect
          x={22}
          y={23}
          width={196}
          height={46}
          rx={2}
          fill={isBlue ? "#0284c7" : "#84cc16"}
          stroke="#1e293b"
        />
        <text
          x={30}
          y={42}
          fontSize={13}
          fontWeight="bold"
          fontFamily="monospace"
          fill={isBlue ? "#f8fafc" : "#1a2e05"}
          letterSpacing={1.5}
        >
          {lines[0]}
        </text>
        <text
          x={30}
          y={61}
          fontSize={13}
          fontWeight="bold"
          fontFamily="monospace"
          fill={isBlue ? "#f8fafc" : "#1a2e05"}
          letterSpacing={1.5}
        >
          {lines[1]}
        </text>
        <text x={12} y={5} fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator} (16×2 LCD)
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 10. SERVO MOTOR (SG90 with Animated Rotating Horn)
  // --------------------------------------------------------------------------
  if (type === "servo_motor") {
    const angle = runtimeState?.angle ?? Number(properties.defaultAngle ?? 90)
    return (
      <g>
        {catalog.pins.map((p) => (
          <line key={p.id} x1={p.x} y1={84} x2={p.x} y2={100} stroke="#991b1b" strokeWidth={2} />
        ))}
        <rect x={16} y={16} width={78} height={68} rx={6} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={2} />
        <circle cx={55} cy={46} r={20} fill="#1e293b" stroke="#94a3b8" strokeWidth={1.5} />
        {/* Rotating Servo Horn */}
        <g transform={`rotate(${angle - 90}, 55, 46)`}>
          <rect x={50} y={12} width={10} height={42} rx={5} fill="#f8fafc" stroke="#334155" strokeWidth={1.5} />
          <circle cx={55} cy={46} r={5} fill="#dc2626" />
        </g>
        <text x={55} y={11} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator} ({angle}°)
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 11. ULTRASONIC SENSOR (HC-SR04)
  // --------------------------------------------------------------------------
  if (type === "ultrasonic_hcsr04") {
    const dist = Number(properties.distanceCm ?? 45)
    return (
      <g>
        {catalog.pins.map((p) => (
          <g key={p.id}>
            <line x1={p.x} y1={74} x2={p.x} y2={90} stroke="#991b1b" strokeWidth={2} />
            <text x={p.x} y={71} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="#ffffff">
              {p.label}
            </text>
          </g>
        ))}
        <rect x={6} y={14} width={128} height={60} rx={5} fill="#0284c7" stroke="#0c4a6e" strokeWidth={2} />
        <circle cx={38} cy={42} r={20} fill="#cbd5e1" stroke="#334155" strokeWidth={2} />
        <circle cx={38} cy={42} r={13} fill="#475569" />
        <circle cx={102} cy={42} r={20} fill="#cbd5e1" stroke="#334155" strokeWidth={2} />
        <circle cx={102} cy={42} r={13} fill="#475569" />
        <text x={70} y={10} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
          {designator}: {dist} cm
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 12. MULTIMETER / DC VOLTMETER
  // --------------------------------------------------------------------------
  if (type === "multimeter") {
    const v = runtimeState?.measuredVoltage ?? 0
    return (
      <g>
        {catalog.pins.map((p) => (
          <line key={p.id} x1={p.x} y1={68} x2={p.x} y2={84} stroke="#991b1b" strokeWidth={2} />
        ))}
        <rect x={8} y={8} width={94} height={60} rx={6} fill="#eab308" stroke="#713f12" strokeWidth={2} />
        <rect x={16} y={16} width={78} height={32} rx={3} fill="#0f172a" />
        <text
          x={55}
          y={38}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fontFamily="monospace"
          fill="#22c55e"
        >
          {v.toFixed(2)} V
        </text>
        <text x={32} y={62} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#7f1d1d">
          V+
        </text>
        <text x={78} y={62} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#0f172a">
          COM
        </text>
      </g>
    )
  }

  // --------------------------------------------------------------------------
  // 13. GENERIC / OTHER SENSORS, BOARDS & OUTPUTS
  // --------------------------------------------------------------------------
  return (
    <g>
      {catalog.pins.map((pin) => {
        if (pin.leadDirection === "top") {
          return <line key={pin.id} x1={pin.x} y1={0} x2={pin.x} y2={16} stroke="#991b1b" strokeWidth={2} />
        }
        if (pin.leadDirection === "bottom") {
          return (
            <line
              key={pin.id}
              x1={pin.x}
              y1={catalog.height - 16}
              x2={pin.x}
              y2={catalog.height}
              stroke="#991b1b"
              strokeWidth={2}
            />
          )
        }
        if (pin.leadDirection === "left") {
          return <line key={pin.id} x1={0} y1={pin.y} x2={16} y2={pin.y} stroke="#991b1b" strokeWidth={2} />
        }
        if (pin.leadDirection === "right") {
          return (
            <line
              key={pin.id}
              x1={catalog.width - 16}
              y1={pin.y}
              x2={catalog.width}
              y2={pin.y}
              stroke="#991b1b"
              strokeWidth={2}
            />
          )
        }
        return null
      })}

      <rect
        x={12}
        y={14}
        width={catalog.width - 24}
        height={catalog.height - 28}
        rx={6}
        fill={
          catalog.category === "microcontrollers"
            ? "#1e3a8a"
            : catalog.category === "sensors"
            ? "#0f766e"
            : "#334155"
        }
        stroke="#0f172a"
        strokeWidth={2}
      />

      <text
        x={catalog.width / 2}
        y={catalog.height / 2 - 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight="bold"
        fill="#ffffff"
      >
        {designator}
      </text>
      <text
        x={catalog.width / 2}
        y={catalog.height / 2 + 10}
        textAnchor="middle"
        fontSize={9}
        fill="#cbd5e1"
      >
        {catalog.name.split(" ")[0]}
      </text>

      {catalog.pins.map((pin) => (
        <text
          key={`lbl_${pin.id}`}
          x={pin.x}
          y={
            pin.leadDirection === "top"
              ? 26
              : pin.leadDirection === "bottom"
              ? catalog.height - 20
              : pin.y + 3
          }
          textAnchor="middle"
          fontSize={7}
          fontFamily="monospace"
          fill="#f8fafc"
        >
          {pin.label}
        </text>
      ))}
    </g>
  )
}

