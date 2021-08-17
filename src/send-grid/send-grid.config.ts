import sgMail from '@sendgrid/mail';
import ENV from '../env-config';

sgMail.setApiKey(ENV.SENDGRID_API_KEY);
export default sgMail;
