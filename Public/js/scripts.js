document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.querySelector("a[href='#inicio-sesion']");
    const signupLink = document.querySelector(".signup-link"); // Link to signup section
    const loginLink = document.querySelector(".login-link"); // Link to login section
    const loginFormButton = document.querySelector("a[href='#dashboard']"); // Login form button
    const signupFormButton = document.querySelector("a[href='#dashboard']"); // Login form button

    const loginSection = document.querySelector("#inicio-sesion"); // Login section
    const signupSection = document.querySelector("#crear-cuenta"); // Signup section
    const dashboardSection = document.querySelector("#dashboard"); // Dashboard section

    // Initially hide all sections except the header
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    dashboardSection.style.display = "none";

    // Show login section when header button is clicked
    loginButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default behavior
        signupSection.style.display = "none"; // Ensure signup is hidden
        dashboardSection.style.display = "none"; // Ensure dashboard is hidden
        loginSection.style.display = "block"; // Show login section
    });

    // Show signup section when "Crear cuenta" link is clicked
    signupLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginSection.style.display = "none";
        dashboardSection.style.display = "none"; // Ensure dashboard is hidden
        signupSection.style.display = "block";
    });

    // Show login section when "Iniciar sesión" link is clicked
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        signupSection.style.display = "none";
        dashboardSection.style.display = "none"; 
        loginSection.style.display = "block";
    });

    // Show dashboard section when login form button is clicked
    loginFormButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent form submission
        loginSection.style.display = "none"; // Hide login section
        dashboardSection.style.display = "block"; // Show dashboard section
    });

    signupFormButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent form submission
        signupSection.style.display = "none"; // Hide login section
        dashboardSection.style.display = "block"; // Show dashboard section
    });
    
    // Conexión al broker MQTT
    const client = mqtt.connect('ws://3.231.109.67:8080');

    // Tópicos de los sensores
    const topics = {
        temperature: 'Temperatura',
        ph: 'pH',
        soilHumidity: 'HumedadSuelo',
        humidity: 'Humedad'
    };

    // Elementos HTML a actualizar por id
    const elements = {
        temperatureExterior: document.getElementById('Temperatura'),
        phInterior: document.getElementById('pH'),
        humidityExterior: document.getElementById('Humedad'),
        humidityInterior: document.getElementById('HumedadSuelo')
    };

    // Conexión al broker MQTT
    client.on('connect', () => {
        console.log('Conectado al broker MQTT');
        // Suscribirse a los tópicos
        Object.values(topics).forEach((topic) => client.subscribe(topic, (err) => {
            if (err) console.error(`Error al suscribirse al tópico: ${topic}`);
        }));
    });

    // Manejo de mensajes recibidos
    client.on('message', (topic, message) => {
        const value = message.toString();
        switch (topic) {
            case topics.temperature:
                // Actualizar la temperatura en el dashboard
                elements.temperatureExterior.textContent = `${value}°C`;
                break;
            case topics.ph:
                // Actualizar el pH en el dashboard
                elements.phInterior.textContent = value;
                break;
            case topics.soilHumidity:
                // Actualizar la humedad del suelo en el dashboard
                elements.humidityInterior.textContent = `${value} g/m`;
                break;
            case topics.humidity:
                // Actualizar la humedad exterior en el dashboard
                elements.humidityExterior.textContent = `${value} g/m`;
                break;
            default:
                console.warn(`Tópico desconocido: ${topic}`);
        }
    });

    //async function fetchHistoricalData() {
        const response = await fetch('http://localhost:3001/historicalData');
        const data = await response.json();
        console.log(data)
        const timestamps = data.map(d => new Date(`${d.date.substring(0,10)}T${d.time}Z`));
        const temperatureData = data.filter(d => d.idTypeSensor === 1).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
        const humidityData = data.filter(d => d.idTypeSensor === 2).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
        const phData = data.filter(d => d.idTypeSensor === 3).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
        const soilHumidityData = data.filter(d => d.idTypeSensor === 4).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
        console.log(soilHumidityData)


        const ctx = document.getElementById('historicalChart')
        new Chart(ctx, {
        type: 'line',
        data: {
            labels:timestamps,
            datasets: [
                { label: 'Temperatura', data: temperatureData, borderColor: 'rgba(255, 99, 132, 1)', fill: false },
                { label: 'Humedad', data: humidityData, borderColor: 'rgba(54, 162, 235, 1)', fill: false },
                { label: 'pH', data: phData, borderColor: 'rgba(75, 192, 192, 1)', fill: false },
                { label: 'Humedad Suelo', data: soilHumidityData, borderColor: 'rgba(153, 102, 255, 1)', fill: false }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'second', tooltipFormat: 'HH:mm:ss' },
                    title: { display: true, text: 'Tiempo' }
                },
                y: { title: { display: true, text: 'Valor' } }
            }
        }
    });



        //return data;
    //}

    /*fetchHistoricalData().then(data => {
        const timestamps = data.map(d => new Date(`${d.date}T${d.time}Z`));
        const temperatureData = data.filter(d => d.sensorId === 1).map(d => ({ x: new Date(`${d.date}T${d.time}Z`), y: d.value }));
        const humidityData = data.filter(d => d.sensorId === 2).map(d => ({ x: new Date(`${d.date}T${d.time}Z`), y: d.value }));
        const phData = data.filter(d => d.sensorId === 3).map(d => ({ x: new Date(`${d.date}T${d.time}Z`), y: d.value }));
        const soilHumidityData = data.filter(d => d.sensorId === 4).map(d => ({ x: new Date(`${d.date}T${d.time}Z`), y: d.value }));

        historicalChart.data.labels = timestamps;
        historicalChart.data.datasets[0].data = temperatureData;
        historicalChart.data.datasets[1].data = humidityData;
        historicalChart.data.datasets[2].data = phData;
        historicalChart.data.datasets[3].data = soilHumidityData;

        historicalChart.update();
    }).catch(error => {
        console.error('Error al obtener los datos históricos:', error);
    });*/
});    