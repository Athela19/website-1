import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);  // Jika tidak ada token
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);  // Jika token tidak valid
      
      // Menetapkan data pengguna pada req.user
      req.user = { id: decoded.userId, email: decoded.email, name: decoded.name };  // Menambahkan objek user
      
      next();  // Lanjutkan ke route handler berikutnya
    });
  };