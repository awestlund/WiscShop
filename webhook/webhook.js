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
async function fetchTags() {
  cat = agent.parameters.Categories;
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    redirect: 'follow'
  }

  let response = await fetch('https://mysqlcs639.cs.wisc.edu/categories/' + cat + '/tags', request);
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
  console.log("here: " + token);

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

  products = result.products;
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

async function clearMessages() {
  let requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    method: 'DELETE',
    redirect: 'follow'
  };
  let response = await fetch('https://mysqlcs639.cs.wisc.edu/application/messages', requestOptions);
  console.log("Status: "+ await response.status);
  console.log("Status: "+ await response.message);
  return response;
}

async function postUserMessages(input) {
  console.log(input);
  let body = JSON.stringify({
    "isUser": true,
    "text": input
  });
  let requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    method: 'POST',
    body: body,
    redirect: 'follow'
  };
  let response = await fetch('https://mysqlcs639.cs.wisc.edu/application/messages', requestOptions);
  console.log("Status: "+ await response.status);
  console.log("Status: "+ await response.message);
  return response;
}

async function postBotMessages(input) {
  console.log(input);
  let body = JSON.stringify({
    "isUser": false,
    "text": input
  });
  let requestOptions = {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: body,
    method: 'POST',
    redirect: 'follow'
  };

  let response = await fetch('https://mysqlcs639.cs.wisc.edu/application/messages', requestOptions);
  console.log("Status: "+ await response.status);
  console.log("Status: "+ await response.message);
  return response;
}

app.get('/', (req, res) => res.send('online'))
app.post('/', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  async function welcome() {
    console.log("welcome");
    agent.add('Webhook works, please Login!');
    await postUserMessages(agent.query);
    await postBotMessages('Webhook works, please Login!');

  }

  //navigate to the cart
  async function navCart() {
    console.log("nav cart");
    agent.add('Navigating to your cart');
    await postUserMessages(agent.query);
    await postBotMessages('Navigating to your cart');
    let body = JSON.stringify({ page: "/" + username + "/cart", dialogflowUpdated: true, back: false });
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

  // navigate to a product poge
  async function navProducts() {
    console.log("Navigating to product");
    agent.add('Navigating to the product');
    await postUserMessages(agent.query);
    await postBotMessages('Navigating to the product');
    cat = agent.parameters.Categories;
    //TODO get product id
    let body = JSON.stringify({ page: "/" + products + "/" + "<product_id>", dialogflowUpdated: true, back: false });
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
  async function deleteTagFunction() {
    tag = agent.parameters.Tags;
    agent.context.delete('Tags');
    console.log("deleting filter " + tag);
    let request = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application/tags/' + tag, request);
  }

  async function deleteTag() {
    tag = agent.parameters.Tags;
    agent.add("deleting " + tag + " filter");
    await postUserMessages(agent.query);
    await postBotMessages("deleting " + tag + " filter");
    deleteTagFunction();
  }

  async function filterBy() {
    cat = agent.context.get('Categories') || { parameters: {} };
    tag = agent.parameters.Tags;
    agent.add("filtering product by " + tag);
    await postUserMessages(agent.query);
    await postBotMessages("filtering product by " + tag);
    agent.context.set({
      'name': 'Tags',
      'lifespan': 2,
      'parameters': tag
    })
    console.log("filtering product by " + tag);
    let request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application/tags/' + tag, request);
  }

  //navigate to a category page
  async function navPages() {
    cat = agent.parameters.Categories;
    console.log("nav " + cat + " page");
    console.log("/" + username + "/" + cat + token)
    //Navigating to new page...
    agent.add("Navigating to the " + cat + " page");
    await postUserMessages(agent.query);
    await postBotMessages("Navigating to the " + cat + " page");
    agent.context.set({
      'name': 'Categories',
      'lifespan': 5,
      'parameters': cat
    })
    let body = JSON.stringify({ page: "/" + username + "/" + cat, dialogflowUpdated: true, back: false });
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
    console.log("done");
  }

  //navigate to the Home page
  async function navHome() {
    console.log("Home");
    console.log(username);
    console.log(token);
    agent.add('Navigating to the home page');
    await postUserMessages(agent.query);
    await postBotMessages("Navigating to the home page");
    let body = JSON.stringify({ page: "/" + username, dialogflowUpdated: true, back: false });
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
    await postUserMessages(agent.query);
    await postBotMessages('Navigating back a page');
    let body = JSON.stringify({ page: "", dialogflowUpdated: true, back: true });
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

  // //logout the user
  // async function logout() {
  //   console.log("logout");
  //   agent.add('Goodbye!');
  //   await postUserMessages(agent.query);
  //   await postBotMessages('Goodbye!');
  //   //Logging you out.
  //   let request = {
  //     method: 'DELETE',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'x-access-token': token
  //     },
  //     redirect: 'follow'
  //   }
  //   await fetch('https://mysqlcs639.cs.wisc.edu/application/products', request);

  // }

  //list out tag/filter options
  async function tags() {
    console.log("tags");
    //listing the tags
    category = agent.parameters.categories();
    options = await fetchTags(category);
    agent.add('Your tag options are as follows:');
    await postUserMessages(agent.query);
    await postBotMessages('Your tag options are as follows:');
    console.log(options);
    for (i of options) {
      agent.add(i);
      await postBotMessages(i);
    }
  }

  //list out items in the cart and the cart total $$$
  async function reviewCart() {
    console.log("review cart");
    agent.add("Here's a review of your cart");
    await postUserMessages(agent.query);
    await postBotMessages("Here's a review of your cart");
    let body = JSON.stringify({ page: "/" + username + "/cart-review", dialogflowUpdated: true, back: false });
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

  //get reviews for a product if it has any
  async function prodRev() {
    console.log("product reviews");
    agent.add("Here's a review of the product");
    await postUserMessages(agent.query);
    await postBotMessages("Here's a review of the product");
    //Here are the reviews:
    ///products/<product_id>/reviews

  }

  //get ratings for a product if it has any
  async function prodRate() {
    console.log("product");
    agent.add("Here's the rating of the product");
    await postUserMessages(agent.query);
    await postBotMessages("Here's the rating of the product");
    //Here is the user rating:

  }

  //list out items in the cart and the cart total $$$
  async function cartContent() {
    console.log("cart contents");
    //ask for product details like quantity
    agent.add('Here are the items in your cart');
    await postUserMessages(agent.query);
    await postBotMessages('Here are the items in your cart');
    //TODO get product id
    let request = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application/products', request);
  }

  //confirm user order
  async function confirmCart() {
    //cart content
    //cart confirm
    console.log("cart confirm");
    agent.add('Cart Ordered');
    await postUserMessages(agent.query);
    await postBotMessages('Cart Order Confirmed');
    let body = JSON.stringify({ page: "/" + username + "/cart-confirmed", dialogflowUpdated: true, back: false });
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

  //delete an item from the cart
  async function cartDelete() {
    console.log("cart delete");
    //Deleting the item from your cart
    console.log("delete item from cart");
    agent.add('Deleting item');
    await postUserMessages(agent.query);
    await postBotMessages('Deleting item');
    //TODO get product id
    let body = JSON.stringify({ page: "/" + products + "/" + agent.query, dialogflowUpdated: true, back: false });
    let request = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: body,
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application', request);
  }

  async function clearCart() {
    console.log("cart delete");
    //Deleting the item from your cart
    console.log("clear all products");
    agent.add('Clearing the cart');
    await postUserMessages(agent.query);
    await postBotMessages('Clearing the cart');
    let request = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application/products', request);
  }

  //add item to the cart
  async function cartAdd() {
    console.log("cart add");
    //ask for product details like quantity
    agent.add('Adding the product to the cart');
    await postUserMessages(agent.query);
    await postBotMessages('Adding the product to the cart');
    //TODO get product id
    let body = JSON.stringify({ page: "/" + products + "/" + agent.query, dialogflowUpdated: true, back: false });
    let request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: body,
      redirect: 'follow'
    }
    await fetch('https://mysqlcs639.cs.wisc.edu/application', request);
  }

  //list out possible item catigories to choose from
  async function categories() {
    console.log("get categories");
    console.log(token);
    agent.add("Your category options are as follows:");
    await postUserMessages(agent.query);
    await postBotMessages("Your category options are as follows:");
    options = await fetchCategories();
    console.log(options);
    for (i of options) {
      agent.add(i);
      await postBotMessages(i);
    }

  }

  //login the user
  async function login() {
    console.log("login");
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username;
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password;
    await postUserMessages(agent.query);
    //get and set token with login info
    await getToken()
    console.log(token);
    agent.add(token);
    agent.add("you are logged on!");
    await postBotMessages("You are logged on!");
  }


  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome)
  // You will need to declare this `Login` content in DialogFlow to make this work
  intentMap.set('Login', login)
  intentMap.set('Back', back)
  intentMap.set('Navigate Cart', navCart)
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
  intentMap.set('Filter Tags', filterBy)
  intentMap.set('Remove Tag', deleteTag)
  intentMap.set('clear cart', clearCart)
  intentMap.set('Clear Messages', clearMessages)

  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
