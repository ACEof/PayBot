const expess = require('express')
const fetch = require('node-fetch')
require('dotenv').config()

const app = expess()

app.get('/', (req, res) => {

    const cost = req.query.cost
    const count = req.query.count
    const total = cost * count
    const url = 'https://api.cloudpayments.ru/orders/create'

    if(total){

        const body = {
            'Amount':total,
            'Currency':'RUB',
            'Description':'Оплата на сайте example.com',
            'Email':'client@test.local',
            'RequireConfirmation':true,
            'SendEmail':false
        }
        fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64')
            }
        })
            .then(res => res.json())
            .then(json => res.send(json))
    } else{
        res.send({'err':'no total'})
    }
        
})

app.listen(8080, () => {
    console.log('Server working')
})