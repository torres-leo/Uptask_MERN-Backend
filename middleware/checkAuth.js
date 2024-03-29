import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			token = req.headers.authorization.split(' ')[1];

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Seleccionando unicamente las columnas necesarias
			req.usuario = await Usuario.findById(decoded.id).select('_id nombre email');
			return next();
		} catch (error) {
			return res.status(404).json({ msg: 'Ha ocurrido un error' });
		}
	}

	if (!token) {
		const error = new Error('Token no válido');
		return res.status(401).json({ msg: error.message });
	}

	next(); // Una vez que termine con el codigo de checkAuth, pasara al siguiente middleware con "next()"
};

export default checkAuth;
