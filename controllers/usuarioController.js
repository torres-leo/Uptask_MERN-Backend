import Usuario from '../models/Usuario.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/emailNode.js';

const registrarUsuario = async (req, res) => {
	// Evitar registros duplicados
	const { email } = req.body;
	const existeUsuario = await Usuario.findOne({ email });

	if (existeUsuario) {
		const error = new Error('El correo ingresado pertenece a otro Usuario');
		return res.status(400).json({ msg: error.message });
	}

	try {
		const usuario = new Usuario(req.body);
		usuario.token = generarId();
		await usuario.save();
		// Enviar el email de confirmacion
		// destructurando los elementosa enviar
		const { nombre, email, token } = usuario;
		emailRegistro({
			nombre,
			email,
			token,
		});
		res.json({ msg: 'Usuario creado correctamente. Revisa tu correo y confirma tu cuenta.' });
	} catch (error) {
		console.log(error);
	}
};

const autenticar = async (req, res) => {
	const { email, password } = req.body;
	// Comprobar si el usuario existe
	const usuario = await Usuario.findOne({ email });
	if (!usuario) {
		const error = new Error('Usuario no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	// Comprobar si el usuario esta confirmado
	if (!usuario.confirmado) {
		const error = new Error('Tu cuenta aún no ha sido confirmada');
		return res.status(404).json({ msg: error.message });
	}

	// Comprobar password
	if (await usuario.comprobarPassword(password)) {
		res.json({
			_id: usuario._id,
			nombre: usuario.nombre,
			email: usuario.email,
			token: generarJWT(usuario._id),
		});
	} else {
		const error = new Error('Contraseña Incorrecta');
		return res.status(404).json({ msg: error.message });
	}
};

// CONFIRMACION DE CUENTAS
const confirmar = async (req, res) => {
	const { token } = req.params;
	const usuarioConfirmar = await Usuario.findOne({ token });

	// En caso de que no exista ese token
	if (!usuarioConfirmar) {
		const error = new Error('Token no válido');
		return res.status(403).json({ msg: error.message });
	}

	// Si existe el token
	try {
		usuarioConfirmar.confirmado = true;
		usuarioConfirmar.token = '';
		await usuarioConfirmar.save();
		res.json({ msg: 'Usuario Confirmado Correctamente' });
	} catch (error) {
		console.log(error);
	}
};

const olvidePassword = async (req, res) => {
	const { email } = req.body;
	// Comprobar si el usuario existe
	const usuario = await Usuario.findOne({ email });
	console.log(usuario);
	if (!usuario) {
		const error = new Error('Usuario no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	try {
		usuario.token = generarId();
		await usuario.save();
		// Enviando el email
		emailOlvidePassword({
			email: usuario.email,
			nombre: usuario.nombre,
			token: usuario.token,
		});

		res.json({
			msg: 'Hemos enviado a tu correo las intrucciones para realizar el cambio de tu contraseña.',
		});
	} catch (error) {
		console.log(error);
	}
};

const comprobarToken = async (req, res) => {
	const { token } = req.params;

	// Validando que el token exista
	const tokenValido = await Usuario.findOne({ token });
	if (tokenValido) {
		res.json({ msg: 'Token válido' });
	} else {
		const error = new Error('Token no válido');
		return res.status(404).json({ msg: error.message });
	}
};

const nuevoPassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	// Comprobando si el token es valido
	const usuario = await Usuario.findOne({ token });
	if (usuario) {
		usuario.password = password;
		usuario.token = '';

		try {
			await usuario.save();
			res.json({ msg: 'Contraseña modificada Correctamente' });
		} catch (error) {
			console.log(error);
		}
	} else {
		const error = new Error('Token no válido');
		return res.status(404).json({ msg: error.message });
	}
};

const perfil = async (req, res) => {
	const { usuario } = req;

	res.json(usuario);
};

export { registrarUsuario, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil };
