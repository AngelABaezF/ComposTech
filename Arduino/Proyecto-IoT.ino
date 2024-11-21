#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <Servo.h>
#include <Stepper.h> // Motores a pasos

// Pines de los sensores y actuadores
#define DS18B20_PIN 4      // Pin del sensor de temperatura para la composta
#define FC28_PIN 34        // Pin analógico del sensor de humedad del suelo
#define DHT_PIN 16         // Pin del sensor DHT22
#define PH_PIN 35          // Pin analógico del sensor de pH

#define SERVO_VENTILA_PIN 26   // Pin del servo para ventila
#define VALVULA_PIN 27         // Pin del relé de la válvula solenoide
#define MOTOR_MEZCLA_PIN_1 18  // Pines del motor a pasos
#define MOTOR_MEZCLA_PIN_2 19
#define MOTOR_MEZCLA_PIN_3 21
#define MOTOR_MEZCLA_PIN_4 22

// Configuración de sensores
OneWire oneWire(DS18B20_PIN);
DallasTemperature soilTempSensor(&oneWire);
DHT dht(DHT_PIN, DHT22);

// Configuración del motor a pasos
const int stepsPerRevolution = 200; // Pasos por revolución del motor
Stepper stepperMotor(stepsPerRevolution, MOTOR_MEZCLA_PIN_1, MOTOR_MEZCLA_PIN_3, MOTOR_MEZCLA_PIN_2, MOTOR_MEZCLA_PIN_4);

// Actuadores
Servo ventilaServo;

// Umbrales
const float TEMP_COMP_HIGH = 50.0;
const int HUMEDAD_COMP_HIGH = 700;
const float TEMP_CONT_HIGH = 35.0;
const int HUMEDAD_CONT_HIGH = 80;
const float PH_HIGH = 8.0;

void setup() {
  Serial.begin(115200);

  // Inicializar sensores
  soilTempSensor.begin();
  dht.begin();

  // Inicializar actuadores
  ventilaServo.attach(SERVO_VENTILA_PIN);
  pinMode(VALVULA_PIN, OUTPUT);

  // Configurar motor a pasos
  stepperMotor.setSpeed(30); // Velocidad del motor en RPM

  // Asegurarse de que actuadores estén apagados al inicio
  digitalWrite(VALVULA_PIN, LOW);
  ventilaServo.write(0);  // Ventila cerrada
}

void loop() {
  // Leer temperatura de la composta
  soilTempSensor.requestTemperatures();
  float soilTemp = soilTempSensor.getTempCByIndex(0);

  // Leer humedad de la composta
  int soilHumidity = analogRead(FC28_PIN);

  // Leer datos del DHT22 (contenedor)
  float contTemp = dht.readTemperature();
  float contHumidity = dht.readHumidity();

  // Leer pH de la composta
  int phRaw = analogRead(PH_PIN);
  float phValue = (phRaw / 1023.0) * 14.0;

  // Control del sistema de ventilación
  if (soilTemp > TEMP_COMP_HIGH || contTemp > TEMP_CONT_HIGH || contHumidity > HUMEDAD_CONT_HIGH) {
    ventilaServo.write(90);  // Abrir ventila
    Serial.println("Sistema de ventilación activado.");
  } else {
    ventilaServo.write(0);   // Cerrar ventila
    Serial.println("Sistema de ventilación desactivado.");
  }

  // Control del sistema de riego
  if (soilHumidity > HUMEDAD_COMP_HIGH || contHumidity > HUMEDAD_CONT_HIGH) {
    digitalWrite(VALVULA_PIN, HIGH); // Abrir válvula
    Serial.println("Sistema de riego activado.");
  } else {
    digitalWrite(VALVULA_PIN, LOW);  // Cerrar válvula
    Serial.println("Sistema de riego desactivado.");
  }

  // Control del sistema de mezcla y riego basado en pH
  if (phValue > PH_HIGH) {
    Serial.println("Sistema de mezcla activado.");
    for (int i = 0; i < 10; i++) { // Realizar 10 revoluciones
      stepperMotor.step(stepsPerRevolution);
    }
    digitalWrite(VALVULA_PIN, HIGH); // Activar riego
    Serial.println("Sistema de mezcla y riego activado por pH alto.");
  } else {
    Serial.println("Sistema de mezcla desactivado.");
  }

  // Mostrar datos
  Serial.print("Soil Temp: "); Serial.println(soilTemp);
  Serial.print("Soil Humidity: "); Serial.println(soilHumidity);
  Serial.print("Container Temp: "); Serial.println(contTemp);
  Serial.print("Container Humidity: "); Serial.println(contHumidity);
  Serial.print("pH Value: "); Serial.println(phValue);

  delay(2000); // Tiempo de espera entre lecturas
}