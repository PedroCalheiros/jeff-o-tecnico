const express = require('express');
const router = express.Router();

router.use('/', (req,res,next) => {
    console.log(req.query.sensor);
    next()
})

router.use('/', (req,res,next) => {
    // if post data in db, do this here
    next()
})

router.get('/', (req,res,next) => {
    res.send("Funcionou")
    res.end();
})

module.exports = router;
