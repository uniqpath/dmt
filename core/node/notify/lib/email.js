import nodemailer from 'nodemailer';

import { log, user as _user } from 'dmt/common';

const user = _user();

let transporter = nodemailer.createTransport({
  host: user.try('server.id'),
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

function notify(msg) {
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
}

function notifyAll(msg) {
  console.log('Sending email...');
}

export { notify, notifyAll };
