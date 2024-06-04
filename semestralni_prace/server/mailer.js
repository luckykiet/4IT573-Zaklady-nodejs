import { createTransport } from 'nodemailer';
import { CONFIG } from './config/config.js';

const transporter = createTransport({
	host: 'smtp.office365.com',
	port: '587',
	tls: false,
	auth: {
		user: CONFIG.MAIL_USER,
		pass: CONFIG.MAIL_PASS,
	},
});

export const sendConfirmationEmail = async ({
	email,
	reservation,
	table,
	store,
}) => {
	const mailOptions = {
		from: {
			name: CONFIG.APP_NAME,
			address: CONFIG.MAIL_USER,
		},
		to: email,
		subject: 'Reservation Confirmation',
		text: `Dear ${reservation.name},\n\nYour reservation has been confirmed.\n\nAt: ${store.name}\n${store.address.street}\n${store.address.city} ${store.address.zip}\n\nDetails:\nTable: ${table.name}\nStart: ${reservation.start}\nEnd: ${reservation.end}\n\nTo cancel your reservation, visit the following link: /reservation/${reservation._id}\n\nThank you for choosing us!`,
		html: `Dear ${reservation.name},<br><br>Your reservation has been confirmed.<br><br>At: ${store.name}<br>${store.address.street}<br>${store.address.city} ${store.address.zip}<br><br>Details:<br>Table: ${table.name}<br>Start: ${reservation.start}<br>End: ${reservation.end}<br><br><a href="/reservation/${reservation._id}">Cancel reservation</a><br><br>Thank you for choosing us!`,
	};

	return await transporter.sendMail(mailOptions);
};

export const sendCancelReservationTokenEmail = async ({
	email,
	reservation,
	table,
	store,
	token,
}) => {
	const cancelLink = `${CONFIG.FRONTEND_URL}/cancel/${token}`;
	const emailText = `Cancel reservation ${reservation._id}`;
	const emailHtml = `
		<p>Your reservation ${reservation._id} cancellation. Link expires in 30 minutes.</p>
		<p>At: ${store.name}</p>
		<p>${store.address.street}</p>
		<p>${store.address.city} ${store.address.zip}</p>
		<p>Table: ${table.name}</p>
      	<p>Click <a href="${cancelLink}">here</a> to cancel your reservation.</p>
    `;

	const mailOptions = {
		from: {
			name: CONFIG.APP_NAME,
			address: CONFIG.MAIL_USER,
		},
		to: email,
		subject: 'Reservation Cancellation',
		text: emailText,
		html: emailHtml,
	};

	return await transporter.sendMail(mailOptions);
};

export const sendCancellationEmail = async ({
	email,
	reservation,
	store,
	table,
}) => {
	const mailOptions = {
		from: {
			name: CONFIG.APP_NAME,
			address: CONFIG.MAIL_USER,
		},
		to: email,
		subject: 'Reservation Cancellation Confirmation',
		text: `Your reservation with ID ${reservation._id} at ${store.name} (table: ${table.name}) has been successfully cancelled.`,
	};

	return await transporter.sendMail(mailOptions);
};
