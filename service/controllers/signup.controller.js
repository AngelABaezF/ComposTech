const mysql = require('../helpers/mysql-config');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        mysql.query('INSERT INTO user (Name, Mail, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).json({ success: false, message: 'Error del servidor', error: err.message });
            }
            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
        });
    } catch (error) {
        console.error('Unexpected error during signup:', error.message);
        res.status(500).json({ success: false, message: 'Error inesperado del servidor', error: error.message });
    }
};
