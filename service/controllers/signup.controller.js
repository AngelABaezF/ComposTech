const mysql = require('../helpers/mysql-config');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    mysql.query('INSERT INTO user (Name, Mail, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error del servidor' });
        }
        res.send({ success: true, message: 'Usuario registrado exitosamente' });
    });
};