import Joi from "joi";

export const sendEmailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().min(3).required(),
  template: Joi.string().required(),
  variables: Joi.object().optional(),
});
