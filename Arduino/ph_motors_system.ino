// Pines del motor a pasos
#define IN1 18  // Línea de control 1
#define IN2 19  // Línea de control 2
#define IN3 21  // Línea de control 3
#define IN4 22  // Línea de control 4

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
}

void loop() {
  // Girar dos vueltas en sentido horario
  girarMotor(4096); // 4096 pasos para dos vueltas completas
  delay(1000);      // Pausa de 1 segundo

  // Girar dos vueltas en sentido antihorario
  girarMotor(-4096);
  delay(1000);      // Pausa de 1 segundo
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

    delay(2); // Ajusta la velocidad del motor (2 ms entre pasos)
  }
}