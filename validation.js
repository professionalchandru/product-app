const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

//Register Validation
const registerValidation = data => {
    const schema = Joi.object().keys({
        _id: Joi.objectId,
        name: Joi.string().min(3).max(255).required(),
        email: Joi.string().min(3).max(255).email().required(),
        password: Joi.string().min(6).required(),
        createdAt: Joi.date()
    });
    return schema.validate(data);
}

//loginValidation
const loginValidation = data => {
    const schema = Joi.object().keys({
        email: Joi.string().min(3).max(255).email().required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

//Insert product validation
const insertProductValidation = data => {
    const schema = Joi.object().keys({
        _id: Joi.objectId,
        name: Joi.string().min(3).max(255).required(),
        category: Joi.string().min(3).max(255).required(),
        price: Joi.number().min(1).required(),
        quantity: Joi.number().min(1).required(),
        description: Joi.string().min(3).max(255),
        insertedAt: Joi.date(),
        likes: Joi.number(),
        likedBy: Joi.array()
    });
    return schema.validate(data);
}

//Edit product validation
const editProductValidation = data => {
    const schema = Joi.object().keys({
        _id: Joi.objectId,
        name: Joi.string().min(3).max(255).required(),
        category: Joi.string().min(3).max(255).required(),
        price: Joi.number().min(1).required(),
        quantity: Joi.number().min(1).required(),
        description: Joi.string().min(3).max(255),
        insertedAt: Joi.date()
    });
    return schema.validate(data);
}

//Edit product Like validation
// const editProductLikeValidation = data => {
//     const schema = Joi.object().keys({
//         _id: Joi.objectId,
//         likes: Joi.number()
//     });
//     return schema.validate(data);
// }


module.exports = { registerValidation, loginValidation, insertProductValidation, editProductValidation }