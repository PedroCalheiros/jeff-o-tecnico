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
    res.sendStatus(204).send("Sensor adicionado")
    res.end();
})

module.exports = router;
