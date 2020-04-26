const router = require('express').Router();
const redis = require('redis');
const client = redis.createClient();

//Import product model for mongoose schema
const productModel = require('../models/productmodel');

//import validatation for products
const { insertProductValidation, editProductValidation, editProductLikeValidation } = require('../validation');

//Import JWT tokens as authentication middleware
const auth = require('../middlewares/auth');


//Insert products
router.post('/insert', auth, async(req, res) => {
    const product = new productModel({
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
    });
    // client.hgetall(productName, (err, obj) => {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         obj.name = productName
    //         console.log(obj)
    //     }
    // })

    //Validate products
    const validate = insertProductValidation(product.toObject());

    if (validate.error == null) {
        try {
            const newProduct = await product.save();
            res.status(200).send(newProduct);

            //likes for product
            // let name = req.body.name
            // client.hset('productLikes', name, 0, (err, reply) => {
            //     if (err) {
            //         console.log(err)
            //     } else {
            //         // console.log(reply)
            //         // client.hgetall(productName, (err, obj) => {
            //         //     if (err) {
            //         //         console.log(err)
            //         //     } else {
            //         //         // obj.name = productName
            //         //         console.log(obj)
            //         //     }
            //         // })
            //     }
            // })
            // console.log(product)
        } catch (err) {
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
        }
    } else {
        console.log(validate.error.message);
        res.status(400).send(validate.error.message);
    }

});

//View Products(list)
router.get('/view', auth, async(req, res) => {
    try {
        const viewProducts = await productModel.find().sort({ price: -1 })
        if (!viewProducts) return res.status(200).send('No product is available');

        let products = [];
        viewProducts.forEach(product => {
                client.get(product.name, (err, obj) => {
                        if (err) console.log(err)
                        else {
                            // res.json({ Products: product, likes: obj })
                            // console.log(product, 'likes: ' + obj)
                            products.push({ product, 'likes': obj })
                                // console.log(products)
                        }
                        res.json(products)
                    })
                    // console.log(JSON.parse(products))
                    // res.json({ product: product, likes: like })
                    // console.log(product.name)
            })
            // JSON.stringify(products);
            // console.log(products)

    } catch (err) {
        if (err) {
            console.log(err)
            res.json({ message: err })
        }
    }
});

// let i = client.incr('abc2', (err, reply) => {
//     if (err) console.log(err)
//     else(console.log('reply ' + reply))
// });


// client.get('abc2', (err, obj) => {
//     if (err) console.log(err)
//     else console.log(obj)
// })


//view single product
router.get('/:name', async(req, res) => {
    try {
        const viewProducts = await productModel.find({ name: req.params.name })
        if (!viewProducts) return res.status(200).send('No product is available');

        let name = req.params.name
        client.get(name, (err, obj) => {
                if (err) console.log(err)
                else {
                    res.json({ viewProducts: viewProducts, likes: obj })
                }
            })
            // client.get(name, (err, obj) => {
            //     if (err) console.log(err)
            //     else console.log(obj)
            // })

    } catch (err) {
        res.json(err)
    }
})

//Edit Product
router.patch('/:name', auth, async(req, res) => {
    //Validate product
    const validate = editProductValidation(req.body);
    if (validate.error == null) {
        try {
            const product = await productModel.findOne({ name: req.params.name });
            if (!product) return res.status(400).send(req.params.name + ' is Invalid product');

            const editProduct = await productModel.updateOne({ name: req.params.name }, { $set: { name: req.body.name, category: req.body.category, price: req.body.price, quantity: req.body.quantity, description: req.body.description } });
            res.send(req.params.name + ' Modified successfully');
        } catch (err) {
            if (err) {
                console.log(err);
                res.json(err)
            }
        }
    } else {
        console.log(validate.error.message);
        res.status(400).json({ message: validate.error.message });
    }
});

//Edit Product Likes
router.patch('/:name/:like', auth, async(req, res) => {
    //Validate product
    const validate = editProductLikeValidation(req.body);
    if (validate.error == null) {
        try {

            //Check if product is avaliable
            const product = await productModel.findOne({ name: req.params.name });
            if (!product) return res.status(400).send(req.params.name + ' is Invalid product');

            //Check user if already liked
            const email = req.user.email
            const likedUser = await productModel.findOne({ name: req.params.name, likedBy: email });

            if (likedUser) {
                return res.status(400).send('You are already liked')
            }

            if (likedUser == null) {
                let name = req.params.name
                const likes = client.incrby(name, 1, (err, reply) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(reply)
                    }
                })

                // client.hget(product.name, (err, obj) => {
                //     if (err) console.log(err)
                //     else console.log(obj)
                // })

                if (likes) {
                    const likedby = await productModel.updateOne({ name: req.params.name }, { $push: { likedBy: req.user.email } });

                    // const like = await productModel.updateOne({ name: req.params.name }, { $push: { likedBy: req.user.email }, $inc: { likes: 1 } });
                    res.send('Likes added for ' + req.params.name + ' successfully.');
                } else {
                    console.log('problems in putting like on redis')
                }

            }
        } catch (err) {
            if (err) {
                console.log(err);
                res.json(err)
            }
        }
    } else {
        console.log(validate.error.message);
        res.status(400).json({ message: validate.error.message });
    }
});

// Delete the product
router.delete('/:name', auth, async(req, res) => {
    try {
        const product = await productModel.findOne({ name: req.params.name });
        if (!product) return res.status(400).send(req.params.name + ' is Invalid product');

        const deleteProduct = await productModel.deleteOne({ name: req.params.name });
        res.send(req.params.name + ' is deleted successfully');
        // res.json(deleteProduct);
    } catch (err) {
        if (err) {
            console.log(err)
            res.json({ message: err });
        }
    }
});



// router.patch('/:name/:li', (req, res) => {
//     let name = req.params.name
//     let myhash = req.params.name
//     client.hset(myhash, name, 0, (err, reply) => {
//         if (err) console.log(err)
//         else console.log(reply)
//     })
//     client.incr('name', (err, reply) => {
//         if (err) console.log(err)
//         else console.log(reply)
//     })
// })

module.exports = router;