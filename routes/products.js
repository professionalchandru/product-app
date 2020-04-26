const router = require('express').Router();
const redis = require('redis');
const client = redis.createClient();

//Import product model for mongoose schema
const productModel = require('../models/productmodel');

//import validatation for products
const { insertProductValidation, editProductValidation } = require('../validation');

//Import JWT tokens as authentication middleware
const auth = require('../middlewares/auth');


//Insert view
router.get('/insert', auth, async(req, res) => {
    res.render('addproducts')
})

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
            // res.status(200).send(newProduct);
            res.status(200).render('addproducts', { success: newProduct.name + ' is added successfully' })
        } catch (err) {
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
        }
    } else {
        console.log(validate.error.message);
        // res.status(400).send(validate.error.message);
        res.status(400).render('addproducts', { error: validate.error.message })
    }

});

//search products
router.get('/search', auth, async(req, res) => {
    res.render('search')
});

router.post('/search', auth, async(req, res, next) => {
    const viewProducts = await productModel.findOne({ name: req.body.name })
    if (!viewProducts) return res.render('search', { error: 'Product is not available' })
    const name = req.body.name
    product = viewProducts
    pname = product.name
    pcategory = product.category
    pquantity = product.quantity
    pprice = product.price
    pdescription = product.description
    plikedby = product.likedBy

    client.get(name, (err, obj) => {
        if (err) return res.render('search', { error: err })
        else {
            res.render('viewproducts', {
                pname: pname,
                pcategory: pcategory,
                pquantity: pquantity,
                pprice: pprice,
                pdescription: pdescription,
                plikedby: plikedby,
                likes: obj
            })
        }
    })
})


//View Products(list)
router.get('/view', auth, async(req, res) => {
    try {
        const viewProducts = await productModel.find()
        const docCount = await productModel.find().countDocuments()
        if (!viewProducts) return res.status(200).send('No product is available');

        res.render('list', {
                product: viewProducts
            })
            // let products = {};
            // let key = 'product'
            // products[key] = [];

        // for (let i = 0; i < docCount; i++) {
        //     client.get(viewProducts[i].name, (err, obj) => {
        //         if (err) console.log(err)
        //         else {
        //             details = {
        //                 "product": viewProducts[i],
        //                 "likes": obj
        //             }
        //             products[key].push(details);
        //         }
        //     }), () => {
        //         console.log(products)
        //         res.render('list', {
        //             product: details
        //         })
        //     }
        // }
        // console.log(viewProducts)

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
router.get('/:name', auth, async(req, res) => {
    try {
        const viewProducts = await productModel.findOne({ name: req.params.name })
        if (!viewProducts) return res.status(200).send('product is not available');
        let name = req.params.name
        product = viewProducts
        pname = product.name
        pcategory = product.category
        pquantity = product.quantity
        pprice = product.price
        pdescription = product.description
        plikedby = product.likedBy

        client.get(name, (err, obj) => {
                if (err) console.log(err)
                else {
                    res.render('viewproducts', {
                        pname: pname,
                        pcategory: pcategory,
                        pquantity: pquantity,
                        pprice: pprice,
                        pdescription: pdescription,
                        plikedby: plikedby,
                        likes: obj
                    })
                }
            })
            // client.get(name, (err, obj) => {
            //         if (err) console.log(err)
            //         else {
            //             res.json({ viewProducts: viewProducts, likes: obj })
            //                 // obj.name = name
            //                 // res.render('viewproducts', {
            //                 //     products: viewProducts,
            //                 //     likes: obj
            //                 // })
            //         }
            //     })
            // client.get(name, (err, obj) => {
            //     if (err) console.log(err)
            //     else console.log(obj)
            // })

    } catch (err) {
        res.json(err)
    }
})

//Edit view
router.get('/edit/:name', async(req, res) => {
    const product = await productModel.findOne({ name: req.params.name });
    pname = product.name
    category = product.category
    price = product.price
    quantity = product.quantity
    description = product.description

    res.render('editproducts', {
        pname: pname,
        category: category,
        price: price,
        quantity: quantity,
        description: description
    })
})

//Edit Product
router.patch('/edit/:name', auth, async(req, res) => {
    //Validate product
    const validate = editProductValidation(req.body);
    if (validate.error == null) {
        try {
            const product = await productModel.findOne({ name: req.params.name });
            if (!product) return res.status(400).render('search', { error: req.params.name + ' is Invalid product' });

            const editProduct = await productModel.updateOne({ name: req.params.name }, { $set: { name: req.body.name, category: req.body.category, price: req.body.price, quantity: req.body.quantity, description: req.body.description } });
            res.render('editproducts', { success: req.params.name + ' Modified successfully' });
        } catch (err) {
            if (err) {
                console.log(err);
                res.json(err)
            }
        }
    } else {
        console.log(validate.error.message);
        res.status(400).render('viewproducts', { error: validate.error.message });
    }
});

//Edit Product Likes
router.patch('/like/:name', auth, async(req, res) => {
    //Validate product
    // const validate = editProductLikeValidation(req.body);
    // if (validate.error == null) {
    try {

        //Check if product is avaliable
        const product = await productModel.findOne({ name: req.params.name });
        if (!product) return res.status(400).send(req.params.name + ' is Invalid product');

        //Check user if already liked
        const email = req.user.email
        const likedUser = await productModel.findOne({ name: req.params.name, likedBy: email });
        let name = req.params.name
        if (likedUser) {
            // return res.redirect('/api/products/:name')
            res.status(400).render('viewproducts', { error: 'You are already liked' })
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
                // res.send('Likes added for ' + req.params.name + ' successfully.');
                // res.redirect('/api/products/req.params.name')
                res.status(200).render('viewproducts', { succes: 'You are liked this products' })
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
    // } else {
    //     console.log(validate.error.message);
    //     // res.status(400).json({ message: validate.error.message });
    //     res.status(400).render('viewproducts', { error: validate.error.message })
    // }
});

// Delete the product
router.delete('/:name', auth, async(req, res) => {
    try {
        const product = await productModel.findOne({ name: req.params.name });
        if (!product) return res.status(400).send(req.params.name + ' is Invalid product');

        const deleteProduct = await productModel.deleteOne({ name: req.params.name });
        res.render('search', { success: req.params.name + ' is deleted successfully' });
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