const express = require('express')
const app = express()
require('dotenv').config()
const mqtt = require('mqtt')
const cors = require('cors')
const port = process.env.PORT
const branch = require('./routes/branch')

app.use(cors())
app.use(express.json())
app.use('/', branch) //Si agregamos /Branch debes borrarlo en el otro

app.listen(port, () => {
    console.log("Servidor corriendo en el puerto "+ port)
})

// Conexión al broker MQTT
const mqttClient = mqtt.connect(`ws://${process.env.MQTTHOST}`, {
    clientId: 'nodejs_mqtt_client'
});

// Topico al que se suscribe
const topic = 'test';

mqttClient.on('connect', () => {
    console.log(`Conectado al broker MQTT.`);
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error(`Error al suscribirse al tópico: ${err.message}`);
        } else {
            console.log(`Suscrito al tópico: ${topic}`);
        }
    });
});

// Manejo de mensajes recibidos desde MQTT
mqttClient.on('message', async (topic, message) => {
    try {
        console.log(`Mensaje recibido en ${topic}:`, message.toString());
        /*const response = await fetch('http://servicio-iot.us-east-1.elasticbeanstalk.com/branch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                branchNo: 'B018',
                street: '123',
                city: message.toString(),
                postcode: '123'
            })
        })

        if (response.ok) {
            const responseData = await response.json();
            console.log(Datos enviados exitosamente:, responseData);
        } else {
            console.error(Error en la respuesta del servidor: ${response.statusText});
        }*/

        // Enviar datos al endpoint
        /*axios.post('http://localhost:3000/branch', data)
            .then((response) => {
                console.log(Datos enviados exitosamente:, response.data);
            })
            .catch((error) => {
                console.error(Error al enviar datos:, error.message);
            });*/
    } catch (error) {
        console.error("Error procesando el mensaje:", error.message);
    }
});

//detener ctrl + c
//node --watch app.js (para que se actualice sola)