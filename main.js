const expess = require('express')
const fetch = require('node-fetch')
require('dotenv').config()

const app = expess()

const url = 'https://api.cloudpayments.ru/orders/create'
const urlStatus = 'https://api.cloudpayments.ru/payments/find'
const urlHook = 'https://app.botmother.com/api/bot/action/H1bjU9lDm/FzD5BZMDpDCCSwZCqCBC-JxDzBvzBJCBcukBWKDJD0BVCcpDnBnD1BgB_PBaWqDs' 

const responseForBot = {
    platform: 'tg',
    users: 'everyone',
    data: {
        message: ''
    }
}

app.get('/', async (req, res) => {

    const cost = req.query.cost
    const count = req.query.count
    const total = cost * count
    

    if(total){

        const body = {
            'Amount':total,
            'Currency':'RUB',
            'Description':'Оплата в боте',
        }
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64')
            }
        })
        const resp = await response.json()
        console.log(resp)
    } else{
        res.send({'err':'no total'})
    }
  
})

app.listen(8080, () => {
    console.log('Server working')
})