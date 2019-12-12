const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const fetch = require('node-fetch')
const base64 = require('base-64')

let username = "";
let password = "";
let token = "";

async function getToken() {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + base64.encode(username + ':' + password)
    },
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://mysqlcs639.cs.wisc.edu/login', request)
  const serverResponse = await serverReturn.json()
  token = serverResponse.token

  return token;
}
// current page is found in app.js

app.get('/', (req, res) => res.send('online'))
app.post('/', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function welcome() {
    agent.add('Webhook works!')
  }

  async function navCart() {

  }

  async function navProducts() {

  }

  async function navPages() {

  }

  async function navHome() {

  }
  
  async function back() {

  }

  async function logout() {

  }

  async function tags() {

  }

  async function reviewCart() {

  }

  async function prodRev() {

  }

  async function prodRate() {

  }

  async function cartContent() {

  }

  async function confirmCart() {

  }

  async function cartDelete() {

  }

  async function cartAdd() {

  }

  async function categories() {

  }

  async function login() {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = null
    // You need to set this from password entity that you declare in DialogFlow
    password = null
    await getToken()

    agent.add(token)
  }


  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome)
  // You will need to declare this `Login` content in DialogFlow to make this work
  intentMap.set('Login', login)
  intentMap.set('Back', back)
  intentMap.set('Navigate Cart', navCart)
  intentMap.set('Logout', logout)
  intentMap.set('Tags', tags)
  intentMap.set('Review Cart', reviewCart)
  intentMap.set('Product Reviews', prodRev)
  intentMap.set('Product Rating', prodRate)
  intentMap.set('Navigate Home', navHome)
  intentMap.set('Navigate Products', navProducts)
  intentMap.set('Navigation Pages', navPages)
  intentMap.set('Get Cart Content', cartContent)
  intentMap.set('Confirm Cart', confirmCart)
  intentMap.set('Cart Delete', cartDelete)
  intentMap.set('Cart Add', cartAdd)
  intentMap.set('Categories', categories)

  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
