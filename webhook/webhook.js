const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const fetch = require('node-fetch')
const base64 = require('base-64')

let username = "";
let password = "";
let token = "";
let categories = [];
let loggedIn = false;
let tags = [];
let products = [];

// pass name of category
async function fetchTags(name) {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  let response = await fetch('https://mysqlcs639.cs.wisc.edu/categories/' + name + '/tags', request);
  let result = await response.json();

  tags = result.tags;
  return tags;
}

async function fetchCategories() {
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  console.log("here1");
  console.log("here: "+ token);

  let response = await fetch('https://mysqlcs639.cs.wisc.edu/categories/', request);
  let result = await response.json();
  console.log(result.categories);
  categories = result.categories;
  return categories;
}

async function fetchProducts() {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("x-access-token", token);

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  let response = await fetch('https://mysqlcs639.cs.wisc.edu/products/', requestOptions);
  let result = await response.json();

  products= result.products;
}

// needs catigory name as input
async function fetchProductsTags(name) {
  if (tags == null || tags.length === 0) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", AsyncStorage.getItem("token"));

    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    let response = await fetch(
      "https://mysqlcs639.cs.wisc.edu/products?category=" + name,
      requestOptions
    );
    let result = await response.json();

    await this.setState({ products: result.products });
  }
  else {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-access-token", AsyncStorage.getItem("token"));

    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    let tagsString = '';

    for (let i = 0; i < tags.length; i++) {
      if (i === tags.length - 1) {
        tagsString += tags[i];
      }
      else {
        tagsString += tags[i] + ',';
      }
    }

    let response = await fetch('https://mysqlcs639.cs.wisc.edu/products?category=' + name + '&tags=' + tagsString, requestOptions);
    let result = await response.json();

    products = result.products;
  }
}

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
  //await AsyncStorage.setItem('token', serverResponse.token);
  return token;
}
// current page is found in app.js

  async function login() {
    if (username != "" && password != "") {

      var data = JSON.stringify({
        "username": username,
        "password": password
      });

      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", 'Basic ' + base64.encode(username + ":" + password));

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      let response = await fetch('https://mysqlcs639.cs.wisc.edu/login', requestOptions);

      let data2 = await response.json();
      let data3 = await response.status;
      if (data3 <= 200) {
        loggedIn =  true;
        token =  data2.token;
        await AsyncStorage.setItem('token', data2.token);
        await AsyncStorage.setItem('username', username);
        //this.props.navigation.navigate('Profile');
        return data2.token;
      }
      else {
        //error
        console.log("Cannot Login in with given info!!");
        console.log("ErrorCode: " + data3);
        console.log("Error: " + data2.message);
        return null
      }
    }
  }

  async function fetchMessages() {
    while(true) {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("x-access-token", token);

      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      let response = await fetch('https://mysqlcs639.cs.wisc.edu/application/messages', requestOptions);
      if(!response.ok) {
  
        continue;
      }
      let result = await response.json();

      if(this.state.messages.length !== result.messages.length) {
        this.setState({messages: result.messages})
        continue;
      }

      for(let i = 0; i < this.state.messages.length; i++) {
        if(result.messages[i] !== this.state.messages[i]) {
          await this.setState({messages: result.messages});
          break;
        }
      }

    }
  }

  function getMessages() {
    let messages = [];

    for(const message of this.state.messages) {
      if(message.isUser) {
        messages.push (
          // <div key={message.id} style={{width: 200, backgroundColor: '#2d78cf', margin: 20, marginLeft: 75, borderRadius: 20, padding: 10}}>
          //   {message.text}
          // </div>
        )
      }
      else {
        messages.push (
          // <div key={message.id} style={{width: 200, backgroundColor: '#b2c4d9', margin: 20, marginLeft: 10, borderRadius: 20, padding: 10}}>
          //   {message.text}
          // </div>
        )
      }
    }

    return messages;
  }

  async function routeFromServer() {
    while(this.state.shouldUpdate) {
      try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-access-token", token);

        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        let response = await fetch('https://mysqlcs639.cs.wisc.edu/application', requestOptions);
        if(!response.ok) {
          throw new Error()
        }
        let result = await response.json();

        let base = window.location.protocol+"//"+window.location.host;
        let serverRoute = window.location.href.replace(base,"");

        if(serverRoute !== result.page) {
          if(result.dialogflowUpdated) { // update app route
            window.location.href = base + result.page;
            this.setState({serverRoute:result.page});

            let body = JSON.stringify({dialogflowUpdated: false});

            requestOptions = {
              method: 'PUT',
              headers: myHeaders,
              body: body,
              redirect: 'follow'
            }

            await fetch('https://mysqlcs639.cs.wisc.edu/application', requestOptions);
          }
          else { // update server route
            let body = JSON.stringify({page: serverRoute, dialogflowUpdated: false});
            this.setState({serverRoute:serverRoute});
            requestOptions = {
              method: 'PUT',
              headers: myHeaders,
              body: body,
              redirect: 'follow'
            }

            await fetch('https://mysqlcs639.cs.wisc.edu/application', requestOptions);
          }
        }
        else { // check for back (from server)
          if(result.back) {
            window.history.back();

            let base = window.location.protocol+"//"+window.location.host;
            let serverRoute = window.location.href.replace(base,"");
            this.setState({serverRoute:serverRoute});

            let body = JSON.stringify({page: serverRoute, dialogflowUpdated: false, back: false});

            requestOptions = {
              method: 'PUT',
              headers: myHeaders,
              body: body,
              redirect: 'follow'
            }

            await fetch('https://mysqlcs639.cs.wisc.edu/application', requestOptions);
          }
        }

  
      }
      catch(error) {
        await this.getToken(AsyncStorage.getItem('username'), AsyncStorage.getItem('password'));
      }
    }
  }

  app.get('/', (req, res) => res.send('online'))
  app.post('/', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function welcome() {
    console.log("welcome");
    agent.add('Webhook works, please Login!');

  }

  //navigate to the cart
  async function navCart() {
    console.log("nav cart");
    //navigating to your cart
    //read in params
    agent.parameters.entity
    agent.query //-> post to messages
    agent.add('Navigating to your cart');

  }

  // navigate to a product poge
  async function navProducts() {
    console.log("Navigating to product");
    agent.add('Navigating to the product');
  }

  //navigate to a category page
  async function navPages() {
    console.log("nav cat page");
    //Navigating to new page...
    agent.add('Navigating to the page');
  }

  //navigate to the Home page
  async function navHome() {
    console.log("Home");
    console.log(username);
    agent.add('Navigating to the home page');
    let body = JSON.stringify({page: "/"+username, dialogflowUpdated: false, back: false});
    let request = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: body,
      redirect: 'follow'
    }

    await fetch('https://mysqlcs639.cs.wisc.edu/application', request);

  }

  //navigate back
  async function back() {
    console.log("back");
    agent.add('Navigating back a page');
    let body = JSON.stringify({page: "", dialogflowUpdated: false, back: true});
    let request = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: body,
      redirect: 'follow'
    }

    await fetch('https://mysqlcs639.cs.wisc.edu/application', request);
    //navigating back
  }

  //logout the user
  async function logout() {
    console.log("logout");
    //Logging you out.

  }

  //list out tag/filter options
  async function tags() {
    console.log("tags");
    //listing the tags
    category = agent.context.categories();
    options = await fetchTags(category);
    agent.add('Your tag options are as follows:');
    console.log(options);
    for (i of options){
      agent.add(i);
    }
  }

  //list out items in the cart and the cart total $$$
  async function reviewCart() {
    console.log("review cart");
    agent.consoleMessages();
    agent.add("Here's a review of your cart: " );
    //Here's a review of your cart:

  }

  //get reviews for a product if it has any
  async function prodRev() {
    console.log("product reviews");
    //Here are the reviews:

  }

  //get ratings for a product if it has any
  async function prodRate() {
    console.log("product");
    //Here is the user rating:

  }

  //list out items in the cart and the cart total $$$
  async function cartContent() {
    console.log("cart contents");
    //Listing cart items
  }

  //confirm user order
  async function confirmCart() {
    //cart content
    //cart confirm
    console.log("cart confirm");
    //Placing your order!
  }

  //delete an item from the cart
  async function cartDelete() {
    console.log("cart delete");
    //Deleting the item from your cart
  }

  //add item to the cart
  async function cartAdd() {
    console.log("cart add");
    //ask for product details like quantity
  }

  //list out possible item catigories to choose from
  async function categories() {
    console.log("get categories");
    console.log(token);
    agent.add("Your category options are as follows:");
    
    options = await fetchCategories();
    console.log(options);
    for (i of options){
      agent.add(i);
    }

    //Here are the categories of products:

  }

  // //get username
  // async function username() {
  //   console.log("get username");
  //   //I entered your username.

  // }

  // //get passowrd
  // async function password() {
  //   console.log("get username");
  //   //I entered the password.
  // }

  //login the user
  async function login() {
    console.log("login");
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username;
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password;

    //get and set token with login info
    await getToken()
    console.log(token);
    agent.add(token);
    agent.add("you are logged on!");

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
  // intentMap.set('Username', username)
  // intentMap.set('Password', password)

  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
