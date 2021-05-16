require('dotenv').config()

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
  auth: {
    api_key: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  }
}

const emailService = nodemailer.createTransport(mg(auth));

const sendMail = (user, req, res) => {
  emailService.sendMail({
    from: 'Proud Pete <me@samples.mailgun.org>',
    to: user.email,
    subject: 'Salaam :)',
    template: {
      name: 'utils/email.handlebars',
      engine: 'handlebars',
      context: user
    }
  }).then((info) => {
    console.log("Mailgun response:", info)
    res.redirect(`/pets/${req.params.id}`);
  }).catch((err) => {
    console.log("Error:", err);
    res.redirect(`/pets/${req.params.id}`);
  });
};

module.exports.sendMail = sendMail;
