const pool = require('../helpers/mysql-config');

exports.getHistoricalData = async (req, res) => {
    try {
        const sql = `
            SELECT idTypeSensor, value, date, time FROM (
                SELECT *, ROW_NUMBER() OVER (PARTITION BY idTypeSensor ORDER BY date DESC, time DESC) AS row_num 
                FROM data
            ) subquery WHERE row_num <= 10 ORDER BY idTypeSensor, date, time
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los datos históricos:', error.message);
        res.status(500).send('Error al obtener los datos históricos');
    }
};