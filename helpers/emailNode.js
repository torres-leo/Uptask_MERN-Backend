import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
	const { nombre, email, token } = datos;

	const transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	// Informacion del email
	const info = await transport.sendMail({
		from: "'UpTask - Administrador de Proyectos' <cuentas@uptask.com",
		to: email,
		subject: 'UpTask - Comprueba tu cuenta',
		text: 'Comprueba tu cuenta UpTask',
		html: `
      <p>Hola ${nombre}, Comprueba tu cuenta en UpTask</p>
      <p>Tu cuenta ya casi está lista, solo debes comprobarla en el siguiente enlace:
        <a href="${process.env.FRONTEND_URL}/confirmar-cuenta/${token}">Comprobar Cuenta</a>
      </p>
      <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.</p>
    `,
	});
};

export const emailOlvidePassword = async (datos) => {
	const { nombre, email, token } = datos;

	const transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	// Informacion del email
	const info = await transport.sendMail({
		from: "'UpTask - Administrador de Proyectos' <cuentas@uptask.com",
		to: email,
		subject: 'UpTask - Reestablece tu contraseña',
		text: 'Reestablece tu contraseña',
		html: `
      <p>Hola ${nombre}, Has solicitado reestablecer tu contraseña.</p>
      <p>Sigue el siguiente enlace para generar un nuevo password:
        <a href="${process.env.FRONTEND_URL}/nuevo-password/${token}">Reestablecer Contraseña</a>
      </p>
      <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje.</p>
    `,
	});
};
