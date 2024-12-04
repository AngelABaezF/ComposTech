const mysql = require('../helpers/mysql-config');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    mysql.query('SELECT * FROM user WHERE Mail = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error del servidor' });
        }
        if (results.length === 0) {
            return res.status(401).send({ message: 'Usuario no encontrado' });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Contraseña incorrecta' });
        }
        res.send({ success: true, message: 'Login exitoso' });
    });
};