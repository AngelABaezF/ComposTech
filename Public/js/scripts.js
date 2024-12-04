document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.querySelector("a[href='#inicio-sesion']");
    const signupLink = document.querySelector(".signup-link"); // Link to signup section
    const loginLink = document.querySelector(".login-link"); // Link to login section

    const loginSection = document.querySelector("#inicio-sesion"); // Login section
    const signupSection = document.querySelector("#crear-cuenta"); // Signup section
    const dashboardSection = document.querySelector("#dashboard"); // Dashboard section
    const exitIcon = document.querySelector("#exit-icon"); // Exit icon for logout

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

    // Handle form submission for login
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto, que es lo correcto
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        if (!email || !password) {
            alert("Porfavor llena los campos");
            return;
        }

        try {
            const response = await fetch('http://alex-iot.us-east-1.elasticbeanstalk.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        
            if (response.ok) {
                loginSection.style.display = "none";
                dashboardSection.style.display = "block";
            } else {
                console.error("Error al iniciar sesión");
            }
        } catch (error) {
            console.error("Error conectando al servidor:", error)
            alert("Error conectando al servidor")
        }
    });

    // Handle form submission for signup
    document.getElementById("signupForm").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        // Captura de valores del formulario    
        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        
        if (!email || !password || !name) {
            alert('Favor de llenar todos los campos');
            return;
        }

        try {
            // Llamada a la API para registrarse
            const response = await fetch('http://alex-iot.us-east-1.elasticbeanstalk.com/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },    
                body: JSON.stringify({ name, email, password })
            });
    
            // Verificación de respuesta del servidor
            if (response.ok) {
                const data = await response.json();
                if (DatasetController.message === "User Created"){
                    console.log(data)
                    alert(data.message); // Muestra mensaje de éxito
                    window.location.href = "#inicio-sesion"; // Redirige al login
                } else {
                    alert(datos.message || "Error al registrar usuario");
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Error al registrarse");
            }
        } catch (error) {
            console.error("Error al enviar solicitud de registro:", error.message);
            alert("Ocurrió un error al registrarse");
        }
    });

    exitIcon.addEventListener("click", () => {
        const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
        if (confirmLogout) {
            // Hide the dashboard section and redirect to the landing page
            dashboardSection.style.display = "none"; // Hide dashboard
            loginSection.style.display = "none"; // Ensure login is hidden
            signupSection.style.display = "none"; // Ensure signup is hidden
        }
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

    const response = await fetch('http://alex-iot.us-east-1.elasticbeanstalk.com/historicalData');
    const data = await response.json();
    console.log(data);
    const timestamps = data.map(d => new Date(`${d.date.substring(0,10)}T${d.time}Z`));
    const temperatureData = data.filter(d => d.idTypeSensor === 1).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
    const humidityData = data.filter(d => d.idTypeSensor === 2).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
    const phData = data.filter(d => d.idTypeSensor === 3).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));
    const soilHumidityData = data.filter(d => d.idTypeSensor === 4).map(d => ({ x: new Date(`${d.date.substring(0,10)}T${d.time}Z`), y: d.value }));

    const ctx = document.getElementById('historicalChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [
                { label: 'Temperatura', data: temperatureData, borderColor: 'rgba(255, 99, 132, 1)', fill: false },
                { label: 'Humedad', data: humidityData, borderColor: 'rgba(54, 162, 235, 1)', fill: false },
                { label: 'pH', data: phData, borderColor: 'rgba(75, 192, 192, 1)', fill: false },
                { label: 'Humedad Suelo', data: soilHumidityData, borderColor: 'rgba(153, 102, 255, 1)', fill: false }
            ]
        },
        options: {
            responsive: true,  // Ensures chart resizes with window
            maintainAspectRatio: false,  // Prevents aspect ratio issues
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd HH:mm:ss' }, // Cambia la unidad de tiempo a 'day' o 'minute'
                    title: { display: true, text: 'Tiempo' }
                },
                y: { title: { display: true, text: 'Valor' } }
            }
        }
    });
});