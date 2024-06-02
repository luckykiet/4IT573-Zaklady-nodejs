import { createTransport } from 'nodemailer';
import { CONFIG } from './config/config';

const transporter = createTransport({
	host: 'smtp.office365.com',
	port: '587',
	tls: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const sendConfirmationEmail = ({ email, reservation, table, store }) => {
	const mailOptions = {
		from: CONFIG.MAIL_SENDER,
		to: email,
		subject: 'Reservation Confirmation',
		text: `Dear ${reservation.name},\n\nYour reservation has been confirmed.\n\nAt ${store.name}\n${store.address.street}\n${store.address.city} ${store.address.zip}\n\nDetails:\nTable: ${table.name}\nStart: ${reservation.start}\nEnd: ${reservation.end}\n\nThank you for choosing us!`,
	};

	return transporter.sendMail(mailOptions);
};

export default {
	sendConfirmationEmail,
};
