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
    console.log("here");
    agent.add('Webhook works!')
  }

  //navigate to the cart
  async function navCart() {
    //navigating to your cart

  }

  // navigate to a product poge
  async function navProducts() {

  }

  //navigate to a category page
  async function navPages() {
    //Navigating to new page...

  }

  //navigate to the Home page
  async function navHome() {
    //Navigating Home

  }
  
  //navigate back
  async function back() {

    //navigating back
  }

  //logout the user
  async function logout() {
    //Logging you out.

  }

  //list out tag/filter options
  async function tags() {
    //listing the tags

  }

  //list out items in the cart and the cart total $$$
  async function reviewCart() {

    //Here's a review of your cart:

  }

  //get reviews for a product if it has any
  async function prodRev() {
    //Here are the reviews:

  }

  //get ratings for a product if it has any
  async function prodRate() {
    //Here is the user rating:

  }

  //list out items in the cart and the cart total $$$
  async function cartContent() {

    //Listing cart items
  }

  //confirm user order
  async function confirmCart() {
    //cart content
    //cart confirm
    //Placing your order!
  }

  //delete an item from the cart
  async function cartDelete() {

    //Deleting the item from your cart
  }

  //add item to the cart
  async function cartAdd() {
    //ask for product details like quantity
  }

  //list out possible item catigories to choose from
  async function categories() {
    //Here are the categories of products:

  }

  //get username
  async function username(){
    //I entered your username.

  }

  //get passowrd
  async function password(){
    //I entered the password.
  }

  //login the user
  async function login() {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = null
    // You need to set this from password entity that you declare in DialogFlow
    password = null

    //get and set token with login info
    await getToken()

    agent.add(token)

    //Logging you on!
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
  intentMap.set('Username', username)
  intentMap.set('Password', password)

  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
