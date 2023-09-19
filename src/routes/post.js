const express = require('express');
const router = express.Router();

const mongo = require('mongodb');

const uri = "mongodb+srv://lorawan-user-admin:q7P6breydZ9McoCN@cluster0.p0yco.mongodb.net/?retryWrites=true&w=majority";
//const DBUrl = "mongodb+srv://horta-user:UUlyfPDTERVfcU1H@cluster0.p0yco.mongodb.net/?retryWrites=true&w=majority";


router.use('/', function(req, res, next) {

    if(req.body.type === 'uplink'){
        console.log('uplink')
        res.locals.type = false;
        res.locals.payload = req.body.params.payload;
        next();
    }
    else if(req.body.type === 'downlink'){
        console.log('downlink')
        res.locals.type = true;
        res.locals.payload = req.body.params.payload;
        next();
    }
    else if(req.body.type === 'downlink_request'){
        res.sendStatus(200);
        res.end();
    }
    else{
        res.sendStatus(400);
        res.end();
    }
    
})

router.use('/', async function(req, res, next) {
    try{
        //const client = await mongo.MongoClient.connect(uri);
        await mongo.MongoClient.connect(uri, async (error,client) => {
            const dbo = await client.db("LORAWAN-Application");
            try {
                const ret = await dbo.collection("End-Devices").findOne({'device':req.body.meta.device})
                
                if(!ret){
                    //create new device collection
                    await dbo.collection("End-Devices").insertOne(req.body.meta);
                }
                else{
                    await dbo.collection("End-Devices").findOneAndUpdate({'device':req.body.meta.device},{$set:req.body.meta});
                }
                res.locals.id = req.body.meta.device;
                res.locals.client = client;
                next();
            } 
            catch (error) {
                res.sendStatus(400);
                res.end();
            }
        })
        // if(!client){
        //     res.sendStatus(400);
        //     res.end()
        // }
        
    }
    catch (err){
        if(err) throw err;
    }
    
})

router.use('/', async function(req, res, next) {
    try {
        // const client = await mongo.MongoClient.connect(uri);
        // if(!client){
        //     res.sendStatus(400);
        //     res.end();
        // }
        const dbo = await res.locals.client.db("LORAWAN-Application");
        try {
            const ret = await dbo.collection("Coll-"+res.locals.id).find(
                {
                    counter:res.locals.type?req.body.params.counter_down:req.body.params.counter_up
                }).sort({"time": -1}).limit(1).toArray();
            if(!ret[0]){
                await dbo.collection("Coll-"+res.locals.id).insertOne(
                    {
                        payload: res.locals.payload,
                        encrypted_payload: req.body.params.encrypted_payload,
                        type: res.locals.type?'downlink':'uplink',
                        counter: res.locals.type?req.body.params.counter_down:req.body.params.counter_up,
                        rx_time: req.body.params.rx_time,
                        radio:req.body.params.radio,
                        time: Date.now()
                    }
                );
                res.locals.client.close();
                next();
            }
            else {
                if((Date.now()/1000)-parseInt(ret[0].time/1000) > 10){
                    await dbo.collection("Coll-"+res.locals.id).insertOne(
                        {
                            payload: res.locals.payload,
                            encrypted_payload: req.body.params.encrypted_payload,
                            type: res.locals.type?'downlink':'uplink',
                            counter: res.locals.type?req.body.params.counter_down:req.body.params.counter_up,
                            rx_time: req.body.params.rx_time,
                            radio:req.body.params.radio,
                            time: Date.now()
                        }
                    );
                    res.locals.try = true;
                }
                else{
                    res.locals.try = false;
                }
                res.locals.client.close();
                next();
            }
        }
        catch (error) {
            res.sendStatus(406);
            res.end();
        }
    }
    catch (err){
        if(err) throw err;
    }
})

router.post('/', function(req, res, next) {
    res.sendStatus(200);
    res.end();
});

module.exports = router;