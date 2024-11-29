const express = require('express');
const mqtt = require('mqtt');
const pool = require('./helpers/mysql-config'); // Conexión a la base de datos en AWS
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Configuración MQTT
const mqttClient = mqtt.connect(`ws://${process.env.MQTTHOST}`, {
    clientId: 'nodejs_mqtt_client'
});

// Tópicos a los que se suscribe
const topics = ['sensor/temperature', 'sensor/humidity', 'sensor/ph', 'sensor/soilHumidity'];

mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT.');
    mqttClient.subscribe(topics, (err) => {
        if (err) {
            console.error('Error al suscribirse a los tópicos:', err.message);
        } else {
            console.log('Suscrito a los tópicos:', topics.join(', '));
        }
    });
});

// Mapeo de tópicos a identificadores en la base de datos
const topicToSensorId = {
    'sensor/temperature': 1, // ID para "Temperatura"
    'sensor/humidity': 2,    // ID para "Humedad"
    'sensor/ph': 3,          // ID para "pH"
    'sensor/soilHumidity': 4 // ID para "HumedadSuelo"
};

// Manejo de mensajes desde MQTT
mqttClient.on('message', async (topic, message) => {
    const value = parseFloat(message.toString()); // Convertir el mensaje a número
    const sensorId = topicToSensorId[topic]; // Obtener el ID del sensor basado en el tópico
    const currentDate = new Date();

    // Formatear fecha y hora
    const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = currentDate.toTimeString().split(' ')[0]; // HH:mm:ss

    if (!sensorId) {
        console.error(`Tópico desconocido: ${topic}`);
        return;
    }

    try {
        // Insertar los datos en la tabla data
        const sql = `
            INSERT INTO data (idTypeSensor, value, date, time, idDevice)
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(sql, [sensorId, value, date, time, 1]); // Asumiendo idDevice = 1 por ahora

        console.log(`Datos guardados: Sensor ID ${sensorId} (${topic}) -> ${value}`);
    } catch (error) {
        console.error('Error al guardar los datos en la base de datos:', error.message);
    }
});

// Servidor Express
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});