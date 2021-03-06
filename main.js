const expess = require('express')
const fetch = require('node-fetch')
require('dotenv').config()
const responseForHook = require('./responseForHook')
const responseForBot = require('./responseForBot')
const requireForPay = require('./requireForPay')
const sub = require('./subscription')

const app = expess()

const url = 'https://api.cloudpayments.ru/orders/create'
const urlStatus = 'https://api.cloudpayments.ru/payments/find'
const urlHook = 'https://app.botmother.com/api/bot/action/H1bjU9lDm/FzD5BZMDpDCCSwZCqCBC-JxDzBvzBJCBcukBWKDJD0BVCcpDnBnD1BgB_PBaWqDs' 
let globalId

app.get('/', async (req, res) => {

    const cost = req.query.cost
    const count = req.query.count
    const total = cost * count
    

    if(total){
        requireForPay.Amount = total
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(requireForPay),
            headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64')
            }
        })
        const resp = await response.json()
        globalId = resp.Model.Number
        res.send(resp)
    } else{
        res.send({'err':'no total'})
    }
  
})

app.get('/webhook/pay', async (req, res) => {
    responseForHook.InvoiceId = globalId
    const response = await fetch(urlStatus, {
        method: 'post',
        headers: { 'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64'),
        },
        body: JSON.stringify(responseForHook)
    })
    const resp = await response.json()
    responseForBot.data.data = resp.Model.CardGolderMessage

    fetch(urlHook, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseForBot)
    })

    res.json({ code: 0 })
})

app.get('/webhook/invalidpay', async (req, res) => {
    responseForHook.InvoiceId = globalId
    const response = await fetch(urlStatus, {
        method: 'post',
        headers: { 'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64'),
        },
        body: JSON.stringify(responseForHook)
    })
    const resp = await response.json()
    responseForBot.data.data = resp.Model.CardHolderMessage
    
    fetch(urlHook, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseForBot)
    })
    
    res.json({ code: 0 })
})

app.get('/sub/month', async (req, res) => {
    let date = new Date()
    sub.interval = 'Month'
    sub.startDate = date

    const response = await fetch('https://api.cloudpayments.ru/subscriptions/create', {
        method: 'post',
        headers: { 'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64'),
        },
        body: JSON.stringify(sub)        
    })
    const resp = await response.json()
    if (resp.Model.Status === 'Active') {
        res.json({status: 'Месячная подписка успешно активирована. Стоимость 100р'})
    }
})

app.get('/sub/week', async (req, res) => {
    let date = new Date()
    sub.interval = 'Week'
    sub.startDate = date

    const response = await fetch('https://api.cloudpayments.ru/subscriptions/create', {
        method: 'post',
        headers: { 'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.USER_PAY}:${process.env.PASS}`).toString('base64'),
        },
        body: JSON.stringify(sub)        
    })
    const resp = await response.json()
    if (resp.Model.Status === 'Active') {
        res.send({status: 'Недельная подписка успешно активирована. Стоимость 40р'}).end()
    }
})

app.listen(8080, () => {
    console.log('Server working')
})