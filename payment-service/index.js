const express = require('express');
const NRP = require('node-redis-pubsub');

const app = express();

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const nrp = new NRP({
    port: 6379,
    scope: 'service',
});

let wallet = 3000;

nrp.on("NEW_ORDER", data => {
    const { name, quantity, total } = data;
    if(total <= wallet) {
        wallet -= total;
        nrp.emit("ORDER_SUCCESS", {
            message: 'Order placed successfully',
            balance: wallet,
        });
    }else{
        nrp.emit("ORDER_ERR", {
            error: "Insufficient funds",
        });
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`); 
});