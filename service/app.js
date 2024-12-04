const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mqtt = require('mqtt');
const pool = require('./helpers/mysql-config');
const historicalDataRoute = require('./routes/historicalData');
const loginRoutes = require('./routes/login'); 
const signupRoutes = require('./routes/signup');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

app.use('/', historicalDataRoute);
app.use('/', loginRoutes);
app.use('/', signupRoutes);

// Configuración MQTT
const mqttClient = mqtt.connect(`ws://${process.env.MQTTHOST}`, {
    clientId: 'nodejs_mqtt_client5'
});

// Mapeo de tópicos a identificadores en la base de datos
const topicToSensorId = {
    'Temperatura': 1,
    'Humedad': 2,
    'pH': 3,
    'HumedadSuelo': 4
};

// Tópicos a los que se suscribe
const topics = ['Temperatura', 'pH', 'HumedadSuelo', 'Humedad'];

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

// Cola para almacenar los datos recibidos (manejando múltiples mensajes)
const dataQueue = [];

// Manejo de mensajes desde MQTT
mqttClient.on('message', async (topic, message) => {
    const value = parseFloat(message.toString());
    const sensorId = topicToSensorId[topic];
    const currentDate = new Date();

    const date = currentDate.toISOString().split('T')[0];
    const time = currentDate.toTimeString().split(' ')[0];

    if (!sensorId) {
        console.error(`Tópico desconocido: ${topic}`);
        return;
    }

    dataQueue.push({ sensorId, value, date, time, deviceId: 1 });
    console.log(`Datos encolados: Sensor ID ${sensorId} (${topic}) -> ${value}`);
});

// Procesar datos de la cola e insertarlos en la base de datos
setInterval(async () => {
    if (dataQueue.length > 0) {
        const data = dataQueue.shift();
        try {
            const sql = `
                INSERT INTO data (idTypeSensor, value, date, time, idDevice)
                VALUES (?, ?, ?, ?, ?)
            `;
            await pool.query(sql, [data.sensorId, data.value, data.date, data.time, data.deviceId]);
            console.log(`Datos guardados: Sensor ID ${data.sensorId} -> ${data.value}`);
        } catch (error) {
            console.error('Error al guardar los datos en la base de datos:', error.message);
        }
    }
}, 500);

// Servidor Express
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

// Código para detener el servidor con ctrl + c
process.on('SIGINT', () => {
    console.log('Deteniendo servidor...');
    process.exit();
});