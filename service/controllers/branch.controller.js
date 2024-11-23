const pool = require('../helpers/mysql-config.js')

const getBranches = async (req, res) => {
    const sql = "SELECT * FROM Branch"
    try{
        const [rows, fields] = await pool.query(sql)
        res.json(rows)
    }catch(error){
        res.json({error: error})
    }
}

const addBranch = async (req, res) => {
    const sql = "INSERT INTO Branch(branchNo, street, city, postcode) VALUES(?, ?, ?, ?)";
    try {
        const {branchNo, street, city, postcode} = req.body
        const [rows, fields] = await pool.query(sql, [branchNo, street, city, postcode])
        res.json(rows)
    }catch(error){
        res.json(error)
    }
}

const deleteBranch = async (req, res) => {
    const sql = "DELETE FROM Branch where branchNo = ?"
    const branchNo = req.params.branchNo
    try{
        const [rows, fields] = await pool.query(sql, [branchNo])
        res.json(rows)
    }catch(error){
        res.json(error)
    }
}

const updateBranch = async (req, res) => {
    const branchNo = req.params.branchNo
    const { street, city, postcode} = req.body
    const sql = "UPDATE Branch SET street = ?, city = ?, postcode = ? WHERE branchNo = ?"
    try{
        const [rows, fields] = await pool.query(sql, [street, city, postcode, branchNo])
        res.json(rows)
    }catch(error){
        res.json(error)
    }
}

module.exports = {getBranches, addBranch, deleteBranch, updateBranch}