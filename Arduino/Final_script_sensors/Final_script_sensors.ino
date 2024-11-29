#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ESP32Servo.h>

#define DHTPIN 15
#define DHTTYPE DHT22
#define PH_PIN 35

// Pines del motor a pasos
#define IN1 18
#define IN2 19
#define IN3 21
#define IN4 22

// Pines para la humedad del suelo y la válvula
#define SensorPin 34
#define bombaPin 27

// Pin del servo
#define SERVO_PIN 2

// Variables globales
DHT sensorDHT(DHTPIN, DHTTYPE);
Servo servo;

// WiFi
const char *ssid = "AABF";
const char *password = "27-01-23";

// MQTT Broker
const char *mqtt_broker = "3.231.109.67";
const char *topic1 = "Temperatura";
const char *topic2 = "Humedad";
const char *topic3 = "pH";
const char *topic4 = "HumedadSuelo"; // Nuevo tópico para humedad del suelo
const int mqtt_port = 1883;

// Rango del sensor de humedad del suelo
const int humedadMin = 0;   // 0 = completamente húmedo
const int humedadMax = 4095; // 4095 = completamente seco

// Estructura para devolver los datos del sensor
struct DatosDHT {
  float humedad;
  float temperaturaC;
};

// Calibración del sensor de pH
float voltageMin = 0.0;  // Voltaje mínimo (pH 0)
float voltageMax = 3.3;  // Voltaje máximo (pH 14)
float phMin = 0.0;       // pH mínimo (pH 0)
float phMax = 14.0;      // pH máximo (pH 14)

// Umbral de pH para activar el motor
float phThreshold = 7;

// Umbral de humedad para activar la válvula
int humedadThreshold = 0; // Umbral en porcentaje

// Umbral de temperatura para activar el servo
float tempThreshold = 25.6; // Umbral en grados Celsius

// Configuración de las secuencias para el motor
int pasos[8][4] = {
  {1, 0, 0, 1}, // Paso 1
  {1, 0, 0, 0}, // Paso 2
  {1, 1, 0, 0}, // Paso 3
  {0, 1, 0, 0}, // Paso 4
  {0, 1, 1, 0}, // Paso 5
  {0, 0, 1, 0}, // Paso 6
  {0, 0, 1, 1}, // Paso 7
  {0, 0, 0, 1}  // Paso 8
};

int pasoActual = 0; // Paso inicial

// Inicializar el WiFi y el PubSubClient
WiFiClient espClient;
PubSubClient client(espClient);

// Función para leer los datos del sensor DHT
DatosDHT leerSensorDHT() {
  DatosDHT datos;

  // Leer datos del sensor
  datos.humedad = sensorDHT.readHumidity();
  datos.temperaturaC = sensorDHT.readTemperature();

  // Verificar si hay error en la lectura
  if (isnan(datos.humedad) || isnan(datos.temperaturaC)) {
    Serial.println("Error en la lectura del sensor");
    datos.humedad = datos.temperaturaC = NAN;
    return datos;
  }

  return datos;
}

// Función para convertir la humedad del suelo a porcentaje
float calcularHumedadPorcentaje(int lectura) {
  float porcentaje = 100.0 - ((lectura - humedadMin) * 100.0 / (humedadMax - humedadMin));
  if (porcentaje < 0) porcentaje = 0; // Limitar rango
  if (porcentaje > 100) porcentaje = 100;
  return porcentaje;
}

void setup() {
  // Inicializar comunicación serial
  Serial.begin(115200);

  // Conectar con WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");

  // Conectar al broker MQTT
  client.setServer(mqtt_broker, mqtt_port);
  while (!client.connected()) {
    String client_id = "esp32-client-";
    client_id += String(WiFi.macAddress());
    Serial.printf("The client %s connects to the public MQTT broker\n", client_id.c_str());
    Serial.println("################################################################################");
    if (client.connect(client_id.c_str())) {
      Serial.println("Public EMQX MQTT broker connected");
    } else {
      Serial.print("Failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }

  // Configurar pines como salida
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(SensorPin, INPUT);
  pinMode(bombaPin, OUTPUT);
  pinMode(PH_PIN, INPUT);

  // Inicializar el servo
  servo.attach(SERVO_PIN, 500, 2500);
  servo.write(0); // Iniciar con el servo cerrado

  delay(300); // Dar tiempo para abrir el monitor serial

  Serial.println("ComposTech");
  sensorDHT.begin();
}

void loop() {
  delay(2000); // Esperar antes de cada lectura

  // Leer datos del sensor DHT
  DatosDHT datos = leerSensorDHT();

  // Leer el valor analógico del sensor de pH
  int rawValue = analogRead(PH_PIN);

  // Convertir el valor leído a voltaje y luego a pH
  float voltage = (rawValue / 4095.0) * voltageMax;
  float pHValue = ((voltage - voltageMin) / (voltageMax - voltageMin)) * (phMax - phMin) + phMin;

  // Leer la humedad del suelo
  int lecturaHumedad = analogRead(SensorPin);
  float humedadSuelo = calcularHumedadPorcentaje(lecturaHumedad);
  Serial.println("--------------------------------------------------------------");
  Serial.print("Lectura cruda del sensor: ");
  Serial.println(lecturaHumedad);
  Serial.print("Humedad del suelo (porcentaje): ");
  Serial.println(humedadSuelo);

  // Publicar los datos al broker MQTT
  char result[20];
  sprintf(result, "%.2f", datos.temperaturaC);
  client.publish(topic1, result);
  sprintf(result, "%.2f", datos.humedad);
  client.publish(topic2, result);
  sprintf(result, "%.2f", pHValue);
  client.publish(topic3, result);
  sprintf(result, "%.2f", humedadSuelo);
  client.publish(topic4, result);

  // Control de pH y motor
  if (pHValue > phThreshold) {
    Serial.println("pH alto, activando motor...");
    girarMotor(4096); // 4096 pasos para dos vueltas completas
    delay(1000);
    girarMotor(-4096);
    delay(1000);
  } else {
    Serial.println("pH dentro del rango normal, motor apagado.");
  }

  // Control de válvula basado en humedad del suelo
  if (humedadSuelo < humedadThreshold) {
    Serial.println("Humedad baja, abriendo válvula...");
    digitalWrite(bombaPin, HIGH);
    delay(2000); // Mantener la válvula abierta 2 segundos
    digitalWrite(bombaPin, LOW);
    Serial.println("Cerrando válvula...");
  } else {
    Serial.println("Humedad suficiente, válvula cerrada.");
  }

  // Control del servo basado en temperatura
  if (datos.temperaturaC > tempThreshold) {
    abrirServo();
  } else if (datos.temperaturaC <= tempThreshold) {
    cerrarServo();
  }
}

void girarMotor(int pasosTotales) {
  int direccion = (pasosTotales > 0) ? 1 : -1;
  pasosTotales = abs(pasosTotales);

  for (int i = 0; i < pasosTotales; i++) {
    pasoActual += direccion;
    if (pasoActual > 7) pasoActual = 0;
    if (pasoActual < 0) pasoActual = 7;

    digitalWrite(IN1, pasos[pasoActual][0]);
    digitalWrite(IN2, pasos[pasoActual][1]);
    digitalWrite(IN3, pasos[pasoActual][2]);
    digitalWrite(IN4, pasos[pasoActual][3]);

    delay(2); // Velocidad del motor
  }
}

// Función para abrir el servo a 45 grados
void abrirServo() {
  if (servo.read() != 90){
    servo.write(90);
    Serial.println("Temperatura alta, abriendo ventila.");
  } else Serial.println("Temperatura alta, ventila ya abierta.");
  
}

// Función para cerrar el servo a 0 grados
void cerrarServo() {
  if (servo.read() != 0){
    servo.write(0);
    Serial.println("Temperatura segura, cerrando ventila.");
  } else Serial.println("Temperatura segura, ventila ya cerrada.");
}