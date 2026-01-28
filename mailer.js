import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendTemplateEmail = async ({
  to,
  subject,
  template,
  variables = {},
}) => {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    `${template}.hbs`
  );

  const source = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = handlebars.compile(source);
  const html = compiledTemplate(variables);

  return transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
