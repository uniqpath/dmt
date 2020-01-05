const nodemailer = require('nodemailer');
const dmt = require('dmt-bridge');
const { log } = dmt;

const user = dmt.user();

let transporter = nodemailer.createTransport({
  host: user.try('server.id'),
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = {
  notify(msg) {
    let mailOptions = {
      from: `"${user.try('server.name')}" <${user.try('server.email')}>`,
      to: `${user.email}`,
      subject: msg,
      text: msg
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
    });
  },

  notifyAll(msg) {
    console.log('Sending email...');
  }
};
