const mysql = require("../helpers/mysql-config");

exports.login = async (req, res) => {
  // Log the request body for debugging
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  try {
    // Query the database for the user by email and password
    const [rows] = await mysql.query(
      "SELECT idUser FROM user WHERE Mail = ? AND password = ?",
      [email, password]
    );

    // If user is found, return success
    if (rows.length > 0) {
      const user = rows[0];
      return res.status(200).json({
        success: true,
        message: "Login successful",
        userId: user.idUser,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Unexpected error during login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error inesperado del servidor",
      error: error.message,
    });
  }
};
