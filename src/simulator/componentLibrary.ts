import type { ComponentCatalogItem, CircuitProjectSchema } from "./types"

export const COMPONENT_LIBRARY: ComponentCatalogItem[] = [
  // ============================================================================
  // 1. MICROCONTROLLERS
  // ============================================================================
  {
    type: "arduino_uno",
    name: "Arduino Uno R3",
    category: "microcontrollers",
    prefix: "SIM",
    description: "ATmega328P microcontroller board with 14 digital I/O pins (6 PWM) and 6 analog inputs.",
    width: 348,
    height: 240,
    defaultProperties: {
      model: "SIMULINO UNO",
      clockMhz: 16,
      voltage: 5,
    },
    propertySchema: [
      { key: "model", label: "Board Marking", type: "string" },
      {
        key: "clockMhz",
        label: "Clock Frequency",
        type: "select",
        options: [
          { label: "16 MHz (Standard)", value: 16 },
          { label: "8 MHz (Low Power)", value: 8 },
        ],
      },
    ],
    pins: [
      // Top header: AREF, GND, D13..D8
      { id: "AREF", label: "AREF", x: 60, y: 0, type: "analog", leadDirection: "top" },
      { id: "GND_TOP", label: "GND", x: 76, y: 0, type: "ground", leadDirection: "top" },
      { id: "D13", label: "13", x: 92, y: 0, type: "digital", leadDirection: "top" },
      { id: "D12", label: "12", x: 108, y: 0, type: "digital", leadDirection: "top" },
      { id: "D11", label: "~11", x: 124, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D10", label: "~10", x: 140, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D9", label: "~9", x: 156, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D8", label: "8", x: 172, y: 0, type: "digital", leadDirection: "top" },
      // Top header right group: D7..D0
      { id: "D7", label: "7", x: 204, y: 0, type: "digital", leadDirection: "top" },
      { id: "D6", label: "~6", x: 220, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D5", label: "~5", x: 236, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D4", label: "4", x: 252, y: 0, type: "digital", leadDirection: "top" },
      { id: "D3", label: "~3", x: 268, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D2", label: "2", x: 284, y: 0, type: "digital", leadDirection: "top" },
      { id: "D1", label: "TX>1", x: 300, y: 0, type: "uart", leadDirection: "top" },
      { id: "D0", label: "RX<0", x: 316, y: 0, type: "uart", leadDirection: "top" },
      // Bottom Power Header
      { id: "RESET", label: "RESET", x: 116, y: 240, type: "digital", leadDirection: "bottom" },
      { id: "3V3", label: "3.3V", x: 132, y: 240, type: "power", leadDirection: "bottom" },
      { id: "5V", label: "5V", x: 148, y: 240, type: "power", leadDirection: "bottom" },
      { id: "GND1", label: "GND", x: 164, y: 240, type: "ground", leadDirection: "bottom" },
      { id: "GND2", label: "GND", x: 180, y: 240, type: "ground", leadDirection: "bottom" },
      { id: "VIN", label: "VIN", x: 196, y: 240, type: "power", leadDirection: "bottom" },
      // Bottom Analog In Header: A0..A5
      { id: "A0", label: "A0", x: 236, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A1", label: "A1", x: 252, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A2", label: "A2", x: 268, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A3", label: "A3", x: 284, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A4", label: "A4", x: 300, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A5", label: "A5", x: 316, y: 240, type: "analog", leadDirection: "bottom" },
    ],
    codeExample: `const int ledPin = 13;

void setup() {
    Serial.begin(9600);
    pinMode(ledPin, OUTPUT);
    Serial.println("Arduino Uno R3 Simulation Started");
}

void loop() {
    digitalWrite(ledPin, HIGH);
    Serial.println("LED D13 -> HIGH");
    delay(1000);

    digitalWrite(ledPin, LOW);
    Serial.println("LED D13 -> LOW");
    delay(1000);
}`,
  },
  {
    type: "arduino_nano",
    name: "Arduino Nano",
    category: "microcontrollers",
    prefix: "NANO",
    description: "Compact ATmega328P breadboard-friendly board with D0-D13 and A0-A7.",
    width: 240,
    height: 120,
    defaultProperties: { clockMhz: 16 },
    propertySchema: [{ key: "clockMhz", label: "Clock (MHz)", type: "number" }],
    pins: [
      { id: "D13", label: "D13", x: 28, y: 0, type: "digital", leadDirection: "top" },
      { id: "3V3", label: "3V3", x: 48, y: 0, type: "power", leadDirection: "top" },
      { id: "A0", label: "A0", x: 68, y: 0, type: "analog", leadDirection: "top" },
      { id: "A1", label: "A1", x: 88, y: 0, type: "analog", leadDirection: "top" },
      { id: "A2", label: "A2", x: 108, y: 0, type: "analog", leadDirection: "top" },
      { id: "A3", label: "A3", x: 128, y: 0, type: "analog", leadDirection: "top" },
      { id: "A4", label: "A4", x: 148, y: 0, type: "analog", leadDirection: "top" },
      { id: "A5", label: "A5", x: 168, y: 0, type: "analog", leadDirection: "top" },
      { id: "5V", label: "5V", x: 188, y: 0, type: "power", leadDirection: "top" },
      { id: "GND1", label: "GND", x: 208, y: 0, type: "ground", leadDirection: "top" },
      // Bottom
      { id: "D12", label: "D12", x: 28, y: 120, type: "digital", leadDirection: "bottom" },
      { id: "D11", label: "~D11", x: 48, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D10", label: "~D10", x: 68, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D9", label: "~D9", x: 88, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D8", label: "D8", x: 108, y: 120, type: "digital", leadDirection: "bottom" },
      { id: "D7", label: "D7", x: 128, y: 120, type: "digital", leadDirection: "bottom" },
      { id: "D6", label: "~D6", x: 148, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D5", label: "~D5", x: 168, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D4", label: "D4", x: 188, y: 120, type: "digital", leadDirection: "bottom" },
      { id: "D3", label: "~D3", x: 208, y: 120, type: "pwm", leadDirection: "bottom" },
      { id: "D2", label: "D2", x: 224, y: 120, type: "digital", leadDirection: "bottom" },
    ],
  },
  {
    type: "arduino_mega",
    name: "Arduino Mega 2560",
    category: "microcontrollers",
    prefix: "MEGA",
    description: "ATmega2560 high-I/O microcontroller board with 54 digital pins and 16 analog inputs.",
    width: 380,
    height: 240,
    defaultProperties: { clockMhz: 16 },
    propertySchema: [{ key: "clockMhz", label: "Clock (MHz)", type: "number" }],
    pins: [
      { id: "GND_TOP", label: "GND", x: 60, y: 0, type: "ground", leadDirection: "top" },
      { id: "D13", label: "13", x: 80, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D12", label: "12", x: 100, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D11", label: "11", x: 120, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D10", label: "10", x: 140, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D9", label: "9", x: 160, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D8", label: "8", x: 180, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D7", label: "7", x: 210, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D6", label: "6", x: 230, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D5", label: "5", x: 250, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D4", label: "4", x: 270, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D3", label: "3", x: 290, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D2", label: "2", x: 310, y: 0, type: "pwm", leadDirection: "top" },
      { id: "5V", label: "5V", x: 120, y: 240, type: "power", leadDirection: "bottom" },
      { id: "GND1", label: "GND", x: 140, y: 240, type: "ground", leadDirection: "bottom" },
      { id: "A0", label: "A0", x: 200, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A1", label: "A1", x: 220, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A2", label: "A2", x: 240, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A3", label: "A3", x: 260, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A4", label: "A4", x: 280, y: 240, type: "analog", leadDirection: "bottom" },
      { id: "A5", label: "A5", x: 300, y: 240, type: "analog", leadDirection: "bottom" },
    ],
  },
  {
    type: "esp32_devkit",
    name: "ESP32 DevKit V1",
    category: "microcontrollers",
    prefix: "ESP",
    description: "Dual-core 240MHz Wi-Fi & BLE SoC with 3.3V GPIO, ADC, DAC, I2C, and PWM.",
    width: 260,
    height: 180,
    defaultProperties: { clockMhz: 240, wifiSsid: "SkilTrix_IoT" },
    propertySchema: [
      { key: "clockMhz", label: "CPU Clock (MHz)", type: "number" },
      { key: "wifiSsid", label: "Simulated Wi-Fi SSID", type: "string" },
    ],
    pins: [
      { id: "3V3", label: "3V3", x: 30, y: 0, type: "power", leadDirection: "top" },
      { id: "GND1", label: "GND", x: 52, y: 0, type: "ground", leadDirection: "top" },
      { id: "D15", label: "G15", x: 74, y: 0, type: "digital", leadDirection: "top" },
      { id: "D2", label: "G2", x: 96, y: 0, type: "digital", leadDirection: "top" },
      { id: "D4", label: "G4", x: 118, y: 0, type: "digital", leadDirection: "top" },
      { id: "D5", label: "G5", x: 140, y: 0, type: "pwm", leadDirection: "top" },
      { id: "D18", label: "G18", x: 162, y: 0, type: "digital", leadDirection: "top" },
      { id: "D19", label: "G19", x: 184, y: 0, type: "digital", leadDirection: "top" },
      { id: "D21", label: "SDA21", x: 206, y: 0, type: "i2c", leadDirection: "top" },
      { id: "D22", label: "SCL22", x: 228, y: 0, type: "i2c", leadDirection: "top" },
      // Bottom
      { id: "5V", label: "VIN", x: 30, y: 180, type: "power", leadDirection: "bottom" },
      { id: "GND2", label: "GND", x: 52, y: 180, type: "ground", leadDirection: "bottom" },
      { id: "D13", label: "G13", x: 74, y: 180, type: "digital", leadDirection: "bottom" },
      { id: "D12", label: "G12", x: 96, y: 180, type: "digital", leadDirection: "bottom" },
      { id: "D14", label: "G14", x: 118, y: 180, type: "digital", leadDirection: "bottom" },
      { id: "D27", label: "G27", x: 140, y: 180, type: "digital", leadDirection: "bottom" },
      { id: "D26", label: "G26", x: 162, y: 180, type: "analog", leadDirection: "bottom" },
      { id: "D25", label: "G25", x: 184, y: 180, type: "analog", leadDirection: "bottom" },
      { id: "A0", label: "G34", x: 206, y: 180, type: "analog", leadDirection: "bottom" },
      { id: "A1", label: "G35", x: 228, y: 180, type: "analog", leadDirection: "bottom" },
    ],
  },
  {
    type: "esp8266_nodemcu",
    name: "ESP8266 NodeMCU",
    category: "microcontrollers",
    prefix: "NODE",
    description: "ESP-12E Wi-Fi microcontroller development board.",
    width: 220,
    height: 150,
    defaultProperties: { clockMhz: 80 },
    propertySchema: [{ key: "clockMhz", label: "CPU Clock (MHz)", type: "number" }],
    pins: [
      { id: "3V3", label: "3V3", x: 30, y: 0, type: "power", leadDirection: "top" },
      { id: "GND1", label: "GND", x: 55, y: 0, type: "ground", leadDirection: "top" },
      { id: "D0", label: "D0", x: 80, y: 0, type: "digital", leadDirection: "top" },
      { id: "D1", label: "D1", x: 105, y: 0, type: "i2c", leadDirection: "top" },
      { id: "D2", label: "D2", x: 130, y: 0, type: "i2c", leadDirection: "top" },
      { id: "D3", label: "D3", x: 155, y: 0, type: "digital", leadDirection: "top" },
      { id: "D4", label: "D4", x: 180, y: 0, type: "digital", leadDirection: "top" },
      { id: "5V", label: "VIN", x: 30, y: 150, type: "power", leadDirection: "bottom" },
      { id: "GND2", label: "GND", x: 55, y: 150, type: "ground", leadDirection: "bottom" },
      { id: "D5", label: "D5", x: 80, y: 150, type: "digital", leadDirection: "bottom" },
      { id: "D6", label: "D6", x: 105, y: 150, type: "digital", leadDirection: "bottom" },
      { id: "D7", label: "D7", x: 130, y: 150, type: "digital", leadDirection: "bottom" },
      { id: "D8", label: "D8", x: 155, y: 150, type: "digital", leadDirection: "bottom" },
      { id: "A0", label: "A0", x: 180, y: 150, type: "analog", leadDirection: "bottom" },
    ],
  },

  // ============================================================================
  // 2. BASIC ELECTRONICS
  // ============================================================================
  {
    type: "resistor",
    name: "Resistor",
    category: "basic",
    prefix: "R",
    description: "Current-limiting passive resistor with configurable resistance in Ohms.",
    width: 100,
    height: 40,
    defaultProperties: {
      resistance: 220,
      tolerance: "5%",
    },
    propertySchema: [
      {
        key: "resistance",
        label: "Resistance (Ω)",
        type: "number",
        min: 1,
        max: 1000000,
        step: 10,
        unit: "Ω",
      },
    ],
    pins: [
      { id: "P1", label: "1", x: 0, y: 20, type: "terminal", leadDirection: "left" },
      { id: "P2", label: "2", x: 100, y: 20, type: "terminal", leadDirection: "right" },
    ],
  },
  {
    type: "led",
    name: "LED (Light Emitting Diode)",
    category: "basic",
    prefix: "D",
    description: "Semiconductor diode that emits visible light when forward-biased from Anode (+) to Cathode (-).",
    width: 60,
    height: 80,
    defaultProperties: {
      color: "yellow",
      forwardVoltage: 2.0,
      maxCurrentMa: 30,
      label: "LED-YELLOW",
    },
    propertySchema: [
      {
        key: "color",
        label: "LED Color",
        type: "select",
        options: [
          { label: "Yellow (LED-YELLOW)", value: "yellow" },
          { label: "Red (LED-RED)", value: "red" },
          { label: "Green (LED-GREEN)", value: "green" },
          { label: "Blue (LED-BLUE)", value: "blue" },
          { label: "White (LED-WHITE)", value: "white" },
        ],
      },
      { key: "forwardVoltage", label: "Forward Voltage (Vf)", type: "number", min: 1.5, max: 3.6, step: 0.1, unit: "V" },
    ],
    pins: [
      { id: "ANODE", label: "A (+)", x: 30, y: 0, type: "terminal", leadDirection: "top" },
      { id: "CATHODE", label: "K (-)", x: 30, y: 80, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "rgb_led",
    name: "RGB LED (Common Cathode)",
    category: "basic",
    prefix: "RGB",
    description: "Full-color 3-channel LED with Red, Green, Blue anodes and common Cathode.",
    width: 96,
    height: 90,
    defaultProperties: { common: "cathode" },
    propertySchema: [],
    pins: [
      { id: "R", label: "R", x: 16, y: 90, type: "terminal", leadDirection: "bottom" },
      { id: "CATHODE", label: "GND", x: 38, y: 90, type: "ground", leadDirection: "bottom" },
      { id: "G", label: "G", x: 60, y: 90, type: "terminal", leadDirection: "bottom" },
      { id: "B", label: "B", x: 82, y: 90, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "pushbutton",
    name: "Push Button (Momentary)",
    category: "basic",
    prefix: "SW",
    description: "Momentary tactile push button. Click during simulation to toggle pressed/released state.",
    width: 80,
    height: 60,
    defaultProperties: {
      pressed: false,
      pullMode: "external",
    },
    propertySchema: [
      { key: "pressed", label: "Closed / Pressed State", type: "boolean" },
    ],
    pins: [
      { id: "P1", label: "1A", x: 0, y: 30, type: "terminal", leadDirection: "left" },
      { id: "P2", label: "2A", x: 80, y: 30, type: "terminal", leadDirection: "right" },
    ],
    codeExample: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
    pinMode(buttonPin, INPUT_PULLUP);
    pinMode(ledPin, OUTPUT);
    Serial.begin(9600);
}

void loop() {
    int btnState = digitalRead(buttonPin);
    if (btnState == LOW) {
        digitalWrite(ledPin, HIGH);
    } else {
        digitalWrite(ledPin, LOW);
    }
    delay(50);
}`,
  },
  {
    type: "spst_switch",
    name: "Toggle Switch (SPST)",
    category: "basic",
    prefix: "SW",
    description: "Single-Pole Single-Throw latching switch.",
    width: 80,
    height: 50,
    defaultProperties: { closed: false },
    propertySchema: [{ key: "closed", label: "Switch Closed (ON)", type: "boolean" }],
    pins: [
      { id: "P1", label: "IN", x: 0, y: 25, type: "terminal", leadDirection: "left" },
      { id: "P2", label: "OUT", x: 80, y: 25, type: "terminal", leadDirection: "right" },
    ],
  },
  {
    type: "potentiometer",
    name: "Potentiometer (Rotary)",
    category: "basic",
    prefix: "RV",
    description: "Variable resistor voltage divider. Adjust wiper position (0-100%) during simulation.",
    width: 90,
    height: 90,
    defaultProperties: {
      resistance: 10000,
      position: 50, // 0..100 %
    },
    propertySchema: [
      { key: "resistance", label: "Total Resistance (Ω)", type: "number", min: 100, max: 1000000, step: 1000 },
      { key: "position", label: "Wiper Position (%)", type: "range", min: 0, max: 100, step: 1, unit: "%" },
    ],
    pins: [
      { id: "VCC", label: "1 (+)", x: 20, y: 90, type: "power", leadDirection: "bottom" },
      { id: "WIPER", label: "W (Out)", x: 45, y: 90, type: "analog", leadDirection: "bottom" },
      { id: "GND", label: "3 (-)", x: 70, y: 90, type: "ground", leadDirection: "bottom" },
    ],
    codeExample: `const int potPin = A0;
const int ledPin = 9;

void setup() {
    pinMode(ledPin, OUTPUT);
    Serial.begin(9600);
}

void loop() {
    int adcVal = analogRead(potPin);
    int pwmVal = map(adcVal, 0, 1023, 0, 255);
    analogWrite(ledPin, pwmVal);
    Serial.println(adcVal);
    delay(100);
}`,
  },
  {
    type: "capacitor",
    name: "Capacitor (Ceramic / Electrolytic)",
    category: "basic",
    prefix: "C",
    description: "Passive energy storage and decoupling capacitor.",
    width: 60,
    height: 70,
    defaultProperties: { capacitanceUf: 10, voltageRating: 25 },
    propertySchema: [
      { key: "capacitanceUf", label: "Capacitance (uF)", type: "number", min: 0.1, max: 4700, step: 1, unit: "µF" },
    ],
    pins: [
      { id: "P1", label: "+", x: 30, y: 0, type: "terminal", leadDirection: "top" },
      { id: "P2", label: "-", x: 30, y: 70, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "diode",
    name: "Rectifier Diode (1N4007)",
    category: "basic",
    prefix: "D",
    description: "Unidirectional silicon rectifier diode (Vf = 0.7V).",
    width: 80,
    height: 40,
    defaultProperties: { partNumber: "1N4007", forwardVoltage: 0.7 },
    propertySchema: [{ key: "partNumber", label: "Part Number", type: "string" }],
    pins: [
      { id: "ANODE", label: "A", x: 0, y: 20, type: "terminal", leadDirection: "left" },
      { id: "CATHODE", label: "K", x: 80, y: 20, type: "terminal", leadDirection: "right" },
    ],
  },
  {
    type: "npn_transistor",
    name: "NPN Transistor (2N2222)",
    category: "basic",
    prefix: "Q",
    description: "Bipolar junction NPN transistor for switching and amplification.",
    width: 70,
    height: 80,
    defaultProperties: { partNumber: "2N2222", hfe: 100 },
    propertySchema: [{ key: "partNumber", label: "Part Number", type: "string" }],
    pins: [
      { id: "BASE", label: "B", x: 0, y: 40, type: "terminal", leadDirection: "left" },
      { id: "COLLECTOR", label: "C", x: 60, y: 0, type: "terminal", leadDirection: "top" },
      { id: "EMITTER", label: "E", x: 60, y: 80, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "breadboard_small",
    name: "Mini Breadboard (Tie-Point)",
    category: "basic",
    prefix: "BB",
    description: "Solderless breadboard with top/bottom power rails and connected vertical columns.",
    width: 220,
    height: 120,
    defaultProperties: { columns: 10 },
    propertySchema: [],
    pins: [
      { id: "VCC_L", label: "+Rail L", x: 20, y: 16, type: "power", leadDirection: "none" },
      { id: "VCC_R", label: "+Rail R", x: 200, y: 16, type: "power", leadDirection: "none" },
      { id: "GND_L", label: "-Rail L", x: 20, y: 104, type: "ground", leadDirection: "none" },
      { id: "GND_R", label: "-Rail R", x: 200, y: 104, type: "ground", leadDirection: "none" },
      { id: "C1_A", label: "1A", x: 48, y: 44, type: "terminal", leadDirection: "none" },
      { id: "C1_B", label: "1B", x: 48, y: 76, type: "terminal", leadDirection: "none" },
      { id: "C2_A", label: "2A", x: 80, y: 44, type: "terminal", leadDirection: "none" },
      { id: "C2_B", label: "2B", x: 80, y: 76, type: "terminal", leadDirection: "none" },
      { id: "C3_A", label: "3A", x: 112, y: 44, type: "terminal", leadDirection: "none" },
      { id: "C3_B", label: "3B", x: 112, y: 76, type: "terminal", leadDirection: "none" },
      { id: "C4_A", label: "4A", x: 144, y: 44, type: "terminal", leadDirection: "none" },
      { id: "C4_B", label: "4B", x: 144, y: 76, type: "terminal", leadDirection: "none" },
      { id: "C5_A", label: "5A", x: 176, y: 44, type: "terminal", leadDirection: "none" },
      { id: "C5_B", label: "5B", x: 176, y: 76, type: "terminal", leadDirection: "none" },
    ],
  },
  {
    type: "gnd",
    name: "Ground Terminal (GND)",
    category: "basic",
    prefix: "GND",
    description: "0V reference schematic ground terminal.",
    width: 40,
    height: 44,
    defaultProperties: {},
    propertySchema: [],
    pins: [
      { id: "GND", label: "GND", x: 20, y: 0, type: "ground", leadDirection: "top" },
    ],
  },
  {
    type: "vcc_5v",
    name: "+5V DC Voltage Rail",
    category: "basic",
    prefix: "VCC",
    description: "Regulated +5V DC schematic power terminal.",
    width: 40,
    height: 44,
    defaultProperties: { voltage: 5.0 },
    propertySchema: [
      { key: "voltage", label: "Supply Voltage (V)", type: "number", min: 1.8, max: 12.0, step: 0.1, unit: "V" },
    ],
    pins: [
      { id: "VCC", label: "+5V", x: 20, y: 44, type: "power", leadDirection: "bottom" },
    ],
  },

  // ============================================================================
  // 3. SENSORS
  // ============================================================================
  {
    type: "ultrasonic_hcsr04",
    name: "Ultrasonic Distance Sensor (HC-SR04)",
    category: "sensors",
    prefix: "US",
    description: "Measures target distance (2cm-400cm) using acoustic echo pulse timing.",
    width: 140,
    height: 90,
    defaultProperties: {
      distanceCm: 45,
    },
    propertySchema: [
      { key: "distanceCm", label: "Target Distance (cm)", type: "range", min: 2, max: 400, step: 1, unit: "cm" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 28, y: 90, type: "power", leadDirection: "bottom" },
      { id: "TRIG", label: "TRIG", x: 56, y: 90, type: "digital", leadDirection: "bottom" },
      { id: "ECHO", label: "ECHO", x: 84, y: 90, type: "digital", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 112, y: 90, type: "ground", leadDirection: "bottom" },
    ],
    codeExample: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
    Serial.begin(9600);
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
}

void loop() {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    long duration = pulseIn(echoPin, HIGH);
    int distanceCm = duration * 0.034 / 2;
    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);
    delay(500);
}`,
  },
  {
    type: "dht11",
    name: "DHT11 / DHT22 Temp & Humidity Sensor",
    category: "sensors",
    prefix: "DHT",
    description: "Digital temperature (°C) and relative humidity (%) environmental sensor.",
    width: 96,
    height: 100,
    defaultProperties: {
      model: "DHT22",
      temperatureC: 26.5,
      humidityPct: 58,
    },
    propertySchema: [
      {
        key: "model",
        label: "Sensor Model",
        type: "select",
        options: [
          { label: "DHT11", value: "DHT11" },
          { label: "DHT22", value: "DHT22" },
        ],
      },
      { key: "temperatureC", label: "Temperature (°C)", type: "range", min: -10, max: 80, step: 0.5, unit: "°C" },
      { key: "humidityPct", label: "Humidity (%)", type: "range", min: 0, max: 100, step: 1, unit: "%" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 24, y: 100, type: "power", leadDirection: "bottom" },
      { id: "DATA", label: "DATA", x: 48, y: 100, type: "digital", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 72, y: 100, type: "ground", leadDirection: "bottom" },
    ],
  },
  {
    type: "ldr_sensor",
    name: "LDR Photoresistor Light Sensor",
    category: "sensors",
    prefix: "LDR",
    description: "Light-dependent sensor with analog (AO) and digital threshold (DO) outputs.",
    width: 96,
    height: 90,
    defaultProperties: {
      luxLevel: 65, // 0..100%
    },
    propertySchema: [
      { key: "luxLevel", label: "Ambient Light (%)", type: "range", min: 0, max: 100, step: 1, unit: "%" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 20, y: 90, type: "power", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 40, y: 90, type: "ground", leadDirection: "bottom" },
      { id: "DO", label: "DO", x: 60, y: 90, type: "digital", leadDirection: "bottom" },
      { id: "AO", label: "AO", x: 80, y: 90, type: "analog", leadDirection: "bottom" },
    ],
  },
  {
    type: "pir_sensor",
    name: "PIR Motion Sensor (HC-SR501)",
    category: "sensors",
    prefix: "PIR",
    description: "Passive infrared human motion detector. Outputs HIGH when motion is triggered.",
    width: 96,
    height: 90,
    defaultProperties: {
      motionDetected: false,
    },
    propertySchema: [
      { key: "motionDetected", label: "Motion Triggered", type: "boolean" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 24, y: 90, type: "power", leadDirection: "bottom" },
      { id: "OUT", label: "OUT", x: 48, y: 90, type: "digital", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 72, y: 90, type: "ground", leadDirection: "bottom" },
    ],
  },
  {
    type: "tmp36",
    name: "TMP36 Analog Temperature Sensor",
    category: "sensors",
    prefix: "TMP",
    description: "Precision centigrade temperature sensor (10mV/°C scale factor, 500mV offset at 0°C).",
    width: 84,
    height: 80,
    defaultProperties: {
      temperatureC: 25,
    },
    propertySchema: [
      { key: "temperatureC", label: "Temperature (°C)", type: "range", min: -40, max: 125, step: 1, unit: "°C" },
    ],
    pins: [
      { id: "VCC", label: "+Vs", x: 20, y: 80, type: "power", leadDirection: "bottom" },
      { id: "VOUT", label: "Vout", x: 42, y: 80, type: "analog", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 64, y: 80, type: "ground", leadDirection: "bottom" },
    ],
  },
  {
    type: "ir_sensor",
    name: "IR Obstacle Avoidance Sensor",
    category: "sensors",
    prefix: "IR",
    description: "Infrared proximity detector. Outputs LOW/HIGH based on obstacle presence.",
    width: 90,
    height: 84,
    defaultProperties: { obstaclePresent: false },
    propertySchema: [{ key: "obstaclePresent", label: "Obstacle Detected", type: "boolean" }],
    pins: [
      { id: "VCC", label: "VCC", x: 20, y: 84, type: "power", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 45, y: 84, type: "ground", leadDirection: "bottom" },
      { id: "OUT", label: "OUT", x: 70, y: 84, type: "digital", leadDirection: "bottom" },
    ],
  },
  {
    type: "soil_moisture",
    name: "Soil Moisture Sensor",
    category: "sensors",
    prefix: "SOIL",
    description: "Capacitive/resistive soil moisture probe with analog output.",
    width: 90,
    height: 96,
    defaultProperties: { moisturePct: 45 },
    propertySchema: [
      { key: "moisturePct", label: "Soil Moisture (%)", type: "range", min: 0, max: 100, step: 1, unit: "%" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 20, y: 0, type: "power", leadDirection: "top" },
      { id: "GND", label: "GND", x: 45, y: 0, type: "ground", leadDirection: "top" },
      { id: "AO", label: "AO", x: 70, y: 0, type: "analog", leadDirection: "top" },
    ],
  },
  {
    type: "gas_mq2",
    name: "MQ-2 Smoke & Gas Sensor",
    category: "sensors",
    prefix: "GAS",
    description: "Chemiresistor gas concentration sensor (LPG, smoke, methane).",
    width: 96,
    height: 90,
    defaultProperties: { gasPpm: 250 },
    propertySchema: [
      { key: "gasPpm", label: "Gas Concentration (PPM)", type: "range", min: 100, max: 5000, step: 50, unit: "ppm" },
    ],
    pins: [
      { id: "VCC", label: "VCC", x: 20, y: 90, type: "power", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 44, y: 90, type: "ground", leadDirection: "bottom" },
      { id: "DO", label: "DO", x: 66, y: 90, type: "digital", leadDirection: "bottom" },
      { id: "AO", label: "AO", x: 84, y: 90, type: "analog", leadDirection: "bottom" },
    ],
  },

  // ============================================================================
  // 4. OUTPUT DEVICES
  // ============================================================================
  {
    type: "buzzer",
    name: "Piezo Buzzer",
    category: "outputs",
    prefix: "BZ",
    description: "Piezoelectric audio sounder driven by digital HIGH or PWM tone() frequencies.",
    width: 80,
    height: 80,
    defaultProperties: {
      resonantFreqHz: 2000,
      enableAudio: false,
    },
    propertySchema: [
      { key: "resonantFreqHz", label: "Default Tone (Hz)", type: "number", min: 100, max: 8000, step: 100 },
      { key: "enableAudio", label: "WebAudio Sound Output", type: "boolean" },
    ],
    pins: [
      { id: "POS", label: "+", x: 26, y: 80, type: "terminal", leadDirection: "bottom" },
      { id: "NEG", label: "-", x: 54, y: 80, type: "ground", leadDirection: "bottom" },
    ],
  },
  {
    type: "servo_motor",
    name: "Micro Servo Motor (SG90)",
    category: "outputs",
    prefix: "SRV",
    description: "0° to 180° rotary actuator controlled via Servo.h or PWM pulse width.",
    width: 110,
    height: 100,
    defaultProperties: {
      defaultAngle: 90,
    },
    propertySchema: [
      { key: "defaultAngle", label: "Initial Angle (°)", type: "range", min: 0, max: 180, step: 1, unit: "°" },
    ],
    pins: [
      { id: "PWM", label: "SIG", x: 30, y: 100, type: "pwm", leadDirection: "bottom" },
      { id: "VCC", label: "VCC", x: 55, y: 100, type: "power", leadDirection: "bottom" },
      { id: "GND", label: "GND", x: 80, y: 100, type: "ground", leadDirection: "bottom" },
    ],
    codeExample: `#include <Servo.h>

Servo myServo;

void setup() {
    myServo.attach(9);
}

void loop() {
    myServo.write(0);
    delay(1000);
    myServo.write(90);
    delay(1000);
    myServo.write(180);
    delay(1000);
}`,
  },
  {
    type: "dc_motor",
    name: "DC Brushed Motor",
    category: "outputs",
    prefix: "M",
    description: "Bidirectional DC motor with live RPM readout proportional to applied voltage.",
    width: 96,
    height: 96,
    defaultProperties: { maxRpm: 3000 },
    propertySchema: [{ key: "maxRpm", label: "Rated RPM @ 5V", type: "number" }],
    pins: [
      { id: "TERM1", label: "M+", x: 30, y: 96, type: "terminal", leadDirection: "bottom" },
      { id: "TERM2", label: "M-", x: 66, y: 96, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "lcd_16x2",
    name: "LCD 16×2 Alphanumeric Display (I2C / Parallel)",
    category: "outputs",
    prefix: "LCD",
    description: "16-column × 2-row HD44780 / I2C character LCD screen with live text rendering.",
    width: 240,
    height: 110,
    defaultProperties: {
      i2cAddress: "0x27",
      backlightColor: "green",
    },
    propertySchema: [
      {
        key: "backlightColor",
        label: "Backlight Theme",
        type: "select",
        options: [
          { label: "Classic Yellow-Green", value: "green" },
          { label: "Blue Backlight", value: "blue" },
        ],
      },
      { key: "i2cAddress", label: "I2C Address", type: "string" },
    ],
    pins: [
      { id: "GND", label: "GND", x: 24, y: 110, type: "ground", leadDirection: "bottom" },
      { id: "VCC", label: "VCC", x: 48, y: 110, type: "power", leadDirection: "bottom" },
      { id: "SDA", label: "SDA", x: 72, y: 110, type: "i2c", leadDirection: "bottom" },
      { id: "SCL", label: "SCL", x: 96, y: 110, type: "i2c", leadDirection: "bottom" },
      { id: "RS", label: "RS", x: 120, y: 110, type: "digital", leadDirection: "bottom" },
      { id: "EN", label: "E", x: 140, y: 110, type: "digital", leadDirection: "bottom" },
      { id: "D4", label: "D4", x: 160, y: 110, type: "digital", leadDirection: "bottom" },
      { id: "D5", label: "D5", x: 180, y: 110, type: "digital", leadDirection: "bottom" },
      { id: "D6", label: "D6", x: 200, y: 110, type: "digital", leadDirection: "bottom" },
      { id: "D7", label: "D7", x: 220, y: 110, type: "digital", leadDirection: "bottom" },
    ],
    codeExample: `#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("SkilTrix Sim!");
}

void loop() {
    lcd.setCursor(0, 1);
    lcd.print("Time: ");
    lcd.print(millis() / 1000);
    lcd.print(" s   ");
    delay(500);
}`,
  },
  {
    type: "oled_128x64",
    name: "OLED Display 128×64 (SSD1306 I2C)",
    category: "outputs",
    prefix: "OLED",
    description: "0.96-inch monochrome I2C graphical & text OLED display.",
    width: 140,
    height: 100,
    defaultProperties: { i2cAddress: "0x3C" },
    propertySchema: [{ key: "i2cAddress", label: "I2C Address", type: "string" }],
    pins: [
      { id: "GND", label: "GND", x: 28, y: 0, type: "ground", leadDirection: "top" },
      { id: "VCC", label: "VCC", x: 56, y: 0, type: "power", leadDirection: "top" },
      { id: "SCL", label: "SCL", x: 84, y: 0, type: "i2c", leadDirection: "top" },
      { id: "SDA", label: "SDA", x: 112, y: 0, type: "i2c", leadDirection: "top" },
    ],
  },
  {
    type: "seven_segment",
    name: "7-Segment LED Display (Common Cathode)",
    category: "outputs",
    prefix: "SEG",
    description: "Single-digit 7-segment numeric LED indicator (Segments A–G + DP).",
    width: 96,
    height: 120,
    defaultProperties: { color: "red" },
    propertySchema: [
      {
        key: "color",
        label: "Segment Color",
        type: "select",
        options: [
          { label: "Red", value: "red" },
          { label: "Green", value: "green" },
          { label: "Amber", value: "yellow" },
        ],
      },
    ],
    pins: [
      { id: "G", label: "G", x: 16, y: 0, type: "terminal", leadDirection: "top" },
      { id: "F", label: "F", x: 34, y: 0, type: "terminal", leadDirection: "top" },
      { id: "COM", label: "GND", x: 52, y: 0, type: "ground", leadDirection: "top" },
      { id: "A", label: "A", x: 70, y: 0, type: "terminal", leadDirection: "top" },
      { id: "B", label: "B", x: 86, y: 0, type: "terminal", leadDirection: "top" },
      { id: "E", label: "E", x: 16, y: 120, type: "terminal", leadDirection: "bottom" },
      { id: "D", label: "D", x: 38, y: 120, type: "terminal", leadDirection: "bottom" },
      { id: "C", label: "C", x: 62, y: 120, type: "terminal", leadDirection: "bottom" },
      { id: "DP", label: "DP", x: 84, y: 120, type: "terminal", leadDirection: "bottom" },
    ],
  },
  {
    type: "relay_module",
    name: "5V SPDT Relay Module",
    category: "outputs",
    prefix: "RLY",
    description: "Electromagnetic relay switch isolated between low-voltage coil and COM/NO/NC contacts.",
    width: 110,
    height: 90,
    defaultProperties: { triggerLevel: "HIGH" },
    propertySchema: [],
    pins: [
      { id: "VCC", label: "VCC", x: 0, y: 20, type: "power", leadDirection: "left" },
      { id: "GND", label: "GND", x: 0, y: 45, type: "ground", leadDirection: "left" },
      { id: "IN", label: "IN", x: 0, y: 70, type: "digital", leadDirection: "left" },
      { id: "NO", label: "NO", x: 110, y: 20, type: "terminal", leadDirection: "right" },
      { id: "COM", label: "COM", x: 110, y: 45, type: "terminal", leadDirection: "right" },
      { id: "NC", label: "NC", x: 110, y: 70, type: "terminal", leadDirection: "right" },
    ],
  },
  {
    type: "multimeter",
    name: "Digital Voltmeter / Multimeter",
    category: "instruments",
    prefix: "VM",
    description: "Measures live DC voltage potential difference between V+ and COM probes.",
    width: 110,
    height: 84,
    defaultProperties: { mode: "DCV" },
    propertySchema: [],
    pins: [
      { id: "VPOS", label: "V+", x: 32, y: 84, type: "terminal", leadDirection: "bottom" },
      { id: "VCOM", label: "COM", x: 78, y: 84, type: "ground", leadDirection: "bottom" },
    ],
  },
]

export function getCatalogItem(type: string): ComponentCatalogItem | undefined {
  return COMPONENT_LIBRARY.find((c) => c.type === type)
}

/**
 * Default Reference Circuit matching the uploaded Proteus / Tinkercad reference image
 * and Section 12 Mandatory Acceptance Test:
 * - SIM1 (SIMULINO UNO)
 * - R1 (220 Ohm Resistor connected to Pin D13)
 * - D1 (LED-YELLOW connected in series with R1)
 * - GND1 (Ground terminal connected to D1 Cathode)
 */
export const DEFAULT_BLINK_CIRCUIT: CircuitProjectSchema = {
  schemaVersion: "1.0.0",
  projectId: "default_uno_blink",
  name: "ArduinoTest - Schematic Capture (D13 LED Blink)",
  boardType: "arduino_uno",
  components: [
    {
      id: "comp_uno_1",
      type: "arduino_uno",
      designator: "SIM1",
      x: 420,
      y: 240,
      rotation: 0,
      properties: { model: "SIMULINO UNO", clockMhz: 16, voltage: 5 },
    },
    {
      id: "comp_res_1",
      type: "resistor",
      designator: "R1",
      x: 340,
      y: 100,
      rotation: 0,
      properties: { resistance: 220, tolerance: "5%" },
    },
    {
      id: "comp_led_1",
      type: "led",
      designator: "D1",
      x: 200,
      y: 120,
      rotation: 0,
      properties: { color: "yellow", forwardVoltage: 2.0, maxCurrentMa: 30, label: "LED-YELLOW" },
    },
    {
      id: "comp_gnd_1",
      type: "gnd",
      designator: "GND1",
      x: 210,
      y: 230,
      rotation: 0,
      properties: {},
    },
  ],
  wires: [
    {
      id: "wire_d13_to_r1",
      fromComponentId: "comp_uno_1",
      fromPinId: "D13",
      toComponentId: "comp_res_1",
      toPinId: "P2",
      color: "#15803d",
    },
    {
      id: "wire_r1_to_led",
      fromComponentId: "comp_res_1",
      fromPinId: "P1",
      toComponentId: "comp_led_1",
      toPinId: "ANODE",
      color: "#15803d",
    },
    {
      id: "wire_led_to_gnd",
      fromComponentId: "comp_led_1",
      fromPinId: "CATHODE",
      toComponentId: "comp_gnd_1",
      toPinId: "GND",
      color: "#15803d",
    },
  ],
  code: `const int ledPin = 13;

void setup() {
    Serial.begin(9600);
    pinMode(ledPin, OUTPUT);
    Serial.println("Simulation Ready: D13 -> R1 (220 ohm) -> D1 (LED) -> GND");
}

void loop() {
    digitalWrite(ledPin, HIGH);
    Serial.println("D13: HIGH (5.0V) | LED ON");
    delay(1000);

    digitalWrite(ledPin, LOW);
    Serial.println("D13: LOW  (0.0V) | LED OFF");
    delay(1000);
}
`,
  updatedAt: new Date().toISOString(),
}

export const PRESET_CIRCUITS: Record<string, CircuitProjectSchema> = {
  blink_d13: DEFAULT_BLINK_CIRCUIT,
  button_input: {
    schemaVersion: "1.0.0",
    projectId: "preset_button_input",
    name: "Push Button Digital Input + LED Control",
    boardType: "arduino_uno",
    components: [
      {
        id: "comp_uno_1",
        type: "arduino_uno",
        designator: "SIM1",
        x: 420,
        y: 240,
        rotation: 0,
        properties: { model: "SIMULINO UNO", clockMhz: 16, voltage: 5 },
      },
      {
        id: "comp_res_1",
        type: "resistor",
        designator: "R1",
        x: 340,
        y: 100,
        rotation: 0,
        properties: { resistance: 220 },
      },
      {
        id: "comp_led_1",
        type: "led",
        designator: "D1",
        x: 200,
        y: 120,
        rotation: 0,
        properties: { color: "green", forwardVoltage: 2.1, maxCurrentMa: 30 },
      },
      {
        id: "comp_gnd_1",
        type: "gnd",
        designator: "GND1",
        x: 210,
        y: 230,
        rotation: 0,
        properties: {},
      },
      {
        id: "comp_btn_1",
        type: "pushbutton",
        designator: "SW1",
        x: 680,
        y: 110,
        rotation: 0,
        properties: { pressed: false },
      },
      {
        id: "comp_gnd_2",
        type: "gnd",
        designator: "GND2",
        x: 790,
        y: 180,
        rotation: 0,
        properties: {},
      },
    ],
    wires: [
      {
        id: "w1",
        fromComponentId: "comp_uno_1",
        fromPinId: "D13",
        toComponentId: "comp_res_1",
        toPinId: "P2",
        color: "#15803d",
      },
      {
        id: "w2",
        fromComponentId: "comp_res_1",
        fromPinId: "P1",
        toComponentId: "comp_led_1",
        toPinId: "ANODE",
        color: "#15803d",
      },
      {
        id: "w3",
        fromComponentId: "comp_led_1",
        fromPinId: "CATHODE",
        toComponentId: "comp_gnd_1",
        toPinId: "GND",
        color: "#15803d",
      },
      {
        id: "w4",
        fromComponentId: "comp_uno_1",
        fromPinId: "D2",
        toComponentId: "comp_btn_1",
        toPinId: "P1",
        color: "#2563eb",
      },
      {
        id: "w5",
        fromComponentId: "comp_btn_1",
        fromPinId: "P2",
        toComponentId: "comp_gnd_2",
        toPinId: "GND",
        color: "#1e293b",
      },
    ],
    code: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
    Serial.begin(9600);
    pinMode(buttonPin, INPUT_PULLUP);
    pinMode(ledPin, OUTPUT);
    Serial.println("Click SW1 Pushbutton on the canvas to toggle D2 input!");
}

void loop() {
    int buttonState = digitalRead(buttonPin);
    if (buttonState == LOW) {
        digitalWrite(ledPin, HIGH);
        Serial.println("Button PRESSED (D2=LOW) -> LED ON");
    } else {
        digitalWrite(ledPin, LOW);
    }
    delay(100);
}
`,
    updatedAt: new Date().toISOString(),
  },
  potentiometer_pwm: {
    schemaVersion: "1.0.0",
    projectId: "preset_pot_pwm",
    name: "Potentiometer Analog A0 + PWM LED & LCD",
    boardType: "arduino_uno",
    components: [
      {
        id: "comp_uno_1",
        type: "arduino_uno",
        designator: "SIM1",
        x: 380,
        y: 220,
        rotation: 0,
        properties: { model: "SIMULINO UNO", clockMhz: 16, voltage: 5 },
      },
      {
        id: "comp_res_1",
        type: "resistor",
        designator: "R1",
        x: 320,
        y: 90,
        rotation: 0,
        properties: { resistance: 220 },
      },
      {
        id: "comp_led_1",
        type: "led",
        designator: "D1",
        x: 190,
        y: 110,
        rotation: 0,
        properties: { color: "red", forwardVoltage: 1.9, maxCurrentMa: 30 },
      },
      {
        id: "comp_gnd_1",
        type: "gnd",
        designator: "GND1",
        x: 200,
        y: 220,
        rotation: 0,
        properties: {},
      },
      {
        id: "comp_pot_1",
        type: "potentiometer",
        designator: "RV1",
        x: 560,
        y: 500,
        rotation: 0,
        properties: { resistance: 10000, position: 65 },
      },
      {
        id: "comp_lcd_1",
        type: "lcd_16x2",
        designator: "LCD1",
        x: 760,
        y: 220,
        rotation: 0,
        properties: { backlightColor: "green", i2cAddress: "0x27" },
      },
    ],
    wires: [
      {
        id: "w1",
        fromComponentId: "comp_uno_1",
        fromPinId: "D9",
        toComponentId: "comp_res_1",
        toPinId: "P2",
        color: "#dc2626",
      },
      {
        id: "w2",
        fromComponentId: "comp_res_1",
        fromPinId: "P1",
        toComponentId: "comp_led_1",
        toPinId: "ANODE",
        color: "#dc2626",
      },
      {
        id: "w3",
        fromComponentId: "comp_led_1",
        fromPinId: "CATHODE",
        toComponentId: "comp_gnd_1",
        toPinId: "GND",
        color: "#15803d",
      },
      {
        id: "w4",
        fromComponentId: "comp_uno_1",
        fromPinId: "5V",
        toComponentId: "comp_pot_1",
        toPinId: "VCC",
        color: "#ef4444",
      },
      {
        id: "w5",
        fromComponentId: "comp_uno_1",
        fromPinId: "A0",
        toComponentId: "comp_pot_1",
        toPinId: "WIPER",
        color: "#eab308",
      },
      {
        id: "w6",
        fromComponentId: "comp_uno_1",
        fromPinId: "GND1",
        toComponentId: "comp_pot_1",
        toPinId: "GND",
        color: "#1e293b",
      },
      {
        id: "w7",
        fromComponentId: "comp_uno_1",
        fromPinId: "A4",
        toComponentId: "comp_lcd_1",
        toPinId: "SDA",
        color: "#0284c7",
      },
      {
        id: "w8",
        fromComponentId: "comp_uno_1",
        fromPinId: "A5",
        toComponentId: "comp_lcd_1",
        toPinId: "SCL",
        color: "#7c3aed",
      },
    ],
    code: `#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int potPin = A0;
const int pwmLedPin = 9;

void setup() {
    Serial.begin(9600);
    pinMode(pwmLedPin, OUTPUT);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("PWM Dimmer Lab");
}

void loop() {
    int adc = analogRead(potPin);
    int pwm = map(adc, 0, 1023, 0, 255);
    analogWrite(pwmLedPin, pwm);

    lcd.setCursor(0, 1);
    lcd.print("ADC:");
    lcd.print(adc);
    lcd.print(" PWM:");
    lcd.print(pwm);
    lcd.print("   ");

    Serial.println(adc);
    delay(200);
}
`,
    updatedAt: new Date().toISOString(),
  },
}

