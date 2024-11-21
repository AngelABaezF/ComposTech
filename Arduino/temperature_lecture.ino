#include <DHT.h>
#define DHTPIN 15       
#define DHTTYPE DHT22 

// Variables globales
DHT sensorDHT(DHTPIN, DHTTYPE);

// Estructura para devolver los datos del sensor
struct DatosDHT {
  float humedad;
  float temperaturaC;
  float temperaturaF;
  float sensacionC;
  float sensacionF;
};

// Función para leer los datos del sensor DHT
DatosDHT leerSensorDHT() {
  DatosDHT datos;

  // Leer datos del sensor
  datos.humedad = sensorDHT.readHumidity();
  datos.temperaturaC = sensorDHT.readTemperature();
  datos.temperaturaF = sensorDHT.readTemperature(true);

  // Verificar si hay error en la lectura
  if (isnan(datos.humedad) || isnan(datos.temperaturaC) || isnan(datos.temperaturaF)) {
    Serial.println("Error en la lectura del sensor");
    datos.humedad = datos.temperaturaC = datos.temperaturaF = NAN;
    datos.sensacionC = datos.sensacionF = NAN;
    return datos;
  }

  // Calcular la sensación térmica
  datos.sensacionC = sensorDHT.computeHeatIndex(datos.temperaturaC, datos.humedad, false);
  datos.sensacionF = sensorDHT.computeHeatIndex(datos.temperaturaF, datos.humedad);

  return datos;
}

void setup() {
  // Inicializar comunicación serial
  Serial.begin(9600);
  delay(300); // Dar tiempo para abrir el monitor serial

  Serial.println("Sensor DHT22, programa de prueba");
  sensorDHT.begin();
}

void loop() {
  delay(2000); // Esperar antes de cada lectura

  // Leer datos del sensor
  DatosDHT datos = leerSensorDHT();

  // Si hubo un error, no imprimir más valores
  if (isnan(datos.humedad)) return;

  // Mostrar los valores en el monitor serial
  Serial.println("=== Lectura del sensor DHT22 ===");
  Serial.print("Humedad Relativa: ");
  Serial.print(datos.humedad);
  Serial.println(" %");
  Serial.print("Temperatura: ");
  Serial.print(datos.temperaturaC);
  Serial.println(" ºC");
  Serial.print(datos.temperaturaF);
  Serial.println(" ºF");
  Serial.print("Sensación Térmica: ");
  Serial.print(datos.sensacionC);
  Serial.println(" ºC");
  Serial.print(datos.sensacionF);
  Serial.println(" ºF");
  Serial.println("===============================");
}
