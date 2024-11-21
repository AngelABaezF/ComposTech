// Pines del motor a pasos
#define IN1 18  // Línea de control 1
#define IN2 19  // Línea de control 2
#define IN3 21  // Línea de control 3
#define IN4 22  // Línea de control 4
#define PH_PIN 35 // Pin donde está conectado el PH-4502C (TO - salida analógica)

// Umbral de pH para activar el motor
float phThreshold = 7.5;

// Calibración del sensor de pH
float voltageMin = 0.0;  // Voltaje mínimo (pH 0)
float voltageMax = 3.3;  // Voltaje máximo (pH 14)
float phMin = 0.0;       // pH mínimo (pH 0)
float phMax = 14.0;      // pH máximo (pH 14)

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

// Variables globales
int pasoActual = 0; // Paso inicial

void setup() {
  // Configurar pines como salida
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Configurar pin del sensor de pH
  pinMode(PH_PIN, INPUT);

  Serial.begin(115200); // Para depuración
}

void loop() {
  // Leer el valor analógico del sensor de pH
  int rawValue = analogRead(PH_PIN);

  // Verificar si el sensor está desconectado (lectura en 0)
  if (rawValue == 0) {
    Serial.println("Advertencia: No se detecta señal del sensor de pH. Revisa la conexión.");
    delay(2000); // Pausa para no saturar el monitor
    return;
  }

  // Convertir el valor leído a voltaje y luego a pH
  float voltage = (rawValue / 4095.0) * voltageMax; // Convertir a voltaje (3.3V como referencia)
  float pHValue = map(voltage, voltageMin, voltageMax, phMin, phMax); // Calcular el pH

  // Mostrar los valores en el monitor serie
  Serial.print("Voltaje: ");
  Serial.print(voltage);
  Serial.print(" V | pH: ");
  Serial.println(pHValue);

  // Condición para activar mezcla si el pH supera el umbral
  if (pHValue > phThreshold) {  
    Serial.println("pH alto, activando motor...");

    // Intentar mover el motor, verificando conexiones
    if (!verificarConexionMotor()) {
      Serial.println("Error: No se detecta conexión del motor. Revisa los cables.");
    } else {
      // Girar dos vueltas en sentido horario
      girarMotor(4096); // 4096 pasos para dos vueltas completas
      delay(100);      // Pausa de 1 segundo
      // Girar dos vueltas en sentido antihorario
      girarMotor(-4096);
      delay(100);      // Pausa de 1 segundo
    }
  } else {
    Serial.println("pH dentro del rango normal, motor apagado.");
  }

  delay(1000); // Esperar 1 segundo antes de la siguiente lectura
}

void girarMotor(int pasosTotales) {
  int direccion = (pasosTotales > 0) ? 1 : -1; // Determina la dirección
  pasosTotales = abs(pasosTotales);           // Trabajamos con el valor absoluto

  for (int i = 0; i < pasosTotales; i++) {
    pasoActual += direccion; // Avanza al siguiente paso en la dirección indicada

    // Ajusta el pasoActual para que esté dentro del rango válido
    if (pasoActual > 7) pasoActual = 0;
    if (pasoActual < 0) pasoActual = 7;

    // Actualiza las salidas del motor
    digitalWrite(IN1, pasos[pasoActual][0]);
    digitalWrite(IN2, pasos[pasoActual][1]);
    digitalWrite(IN3, pasos[pasoActual][2]);
    digitalWrite(IN4, pasos[pasoActual][3]);
    delay(1);
  }
}

// Función para verificar si el motor está conectado
bool verificarConexionMotor() {
  // Comprobar si los pines del motor tienen voltaje mínimo
  if (digitalRead(IN1) == LOW && digitalRead(IN2) == LOW &&
      digitalRead(IN3) == LOW && digitalRead(IN4) == LOW) {
    return false; // El motor no está conectado o no tiene alimentación
  }
  return true;
}