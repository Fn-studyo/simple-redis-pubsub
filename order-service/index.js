const express = require('express');
const NRP = require('node-redis-pubsub');

const app = express();

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 4444;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const nrp = new NRP({
    port: 6379,
    scope: 'service',
});
 
const food = {
    "burger": 150,
    "chicken": 120,
    "pizza": 200,
    "egg": 50,
    "ice-cream": 100,
};

app.post('/order', (req, res) => {
    const { order } = req.body;

    if(!order.name  || !order.quantity) {
        res.status(400).send('Order name or quantity missing');
    }

    let receipt = {
        name: order.name,
        quantity: order.quantity,
        total: food[order.name] * order.quantity,
    }

    
    nrp.emit('NEW_ORDER', receipt);

    nrp.on('ORDER_SUCCESS', message => {
        receipt['balance'] = message.balance; 
        return res.status(200).send({
            message: message.message, 
            receipt
        });
    })
    
    nrp.on('ORDER_ERR', error => {
        return res.json(error);
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`); 
});