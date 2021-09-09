const express = require("express"); //installed express and imported with the require function
const session = require("express-session"); //package to help us create sessions and set cookies(sets the needed cookie for the specified session)
const MongoDBSession = require("connect-mongodb-session")(session);//package that will allow us to save our sessions inside mongodb. we pass it the "session" variable
const bcryptjs = require("bcryptjs"); //allow us to hash our password
const mongoose = require("mongoose"); //mongoose is a object document model that helps talk to mongodb database in an elegant way
const bodyparser = require("body-parser");//body-parser extracts the entire body of an incoming POST request stream and exposes it on req.body
const userModel = require('./models/User'); //import the user schema
const productModel = require('./models/Product'); //import the product schema
const persist = require('./models/Persist'); //import the persist model
const app = express(); //initialized the express function in a variable called app
const mongoURI = 'mongodb://localhost:27017/sessions'; //the uri on my local environment. session = the name of the database inside mongo
const halfHourInMS = 30 * 60 * 1000;
const yearInMs = 1000 * 60 * 60 * 24 * 365;
app.set('view-engine', 'ejs'); //tells our app that ejs is the main language we use
app.use(express.static(__dirname + '/public')); //serve images, CSS files, and JavaScript files in a directory named newproject/public
app.use(express.static(__dirname + '/views/images'));//serve images, CSS files, and JavaScript files in a directory named newproject/views/images
app.use(bodyparser.json()); // support parsing of application/json type post data
app.use(bodyparser.urlencoded({extended: false})); //support parsing of application/x-www-form-urlencoded post data
mongoose.connect(mongoURI, { //connect to mongodb and pass it the uri
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, () => console.log("MongoDB connected!"));

const store = new MongoDBSession({ //create the db
    uri: mongoURI, //uri
    collection: 'mySessions' //collection name
})

async function isInDB() { //initialize the db with user admin + all products
    if(!await userModel.findOne({email:"admin"})) {
        userModel.insertMany(persist.users);
        productModel.insertMany(persist.products);
    }
}
isInDB();

app.use(session({ //middleware that will fire for every consecutive request to the server
    secret: 'key that will sign cookie', //key to protect the session data from being used maliciously (saved to the browser)
    resave: false, //for every request to the server we want to create a new session(even if it's the same user/browser)
    saveUninitialized: false, //if we have not touched/modified the session then we don't want it to be saved
    cookie: { //set the session/cookie time
        maxAge: halfHourInMS,
    },
    store: store, //connect to our mongodb database to store the session in our database
}));

const isAuth = (req,res,next) =>{ //only after logging in isAuth will become true
    if(req.session.isAuth) {
        next(); //move to next function
    } else {
        res.redirect('login');
    }
}

const isAdmin = (req,res,next) =>{ //
    if(req.session.isAuth && req.session.isAdmin){
        next();
    } else {
        if(req.session.isAuth) {
            res.redirect('store');
        } else {
            res.redirect('login');
        }
    }
}

const isCartEmpty = (req,res,next) => { //enter the checkout page only if your cart is not empty
    if(req.session.cart.length > 0 && req.session.isAuth) {
        next();
    } else {
        if(req.session.isAuth) {
            res.redirect('store');
        } else {
            res.redirect('login');
        }
    }
}

app.get("/",(req,res) => {
    res.render('landing.ejs');
});

app.get("/login",(req,res) => {
    if(req.session.isAuth) {
        return res.redirect('store');
    }
    res.render('login.ejs');
});

app.get("/register",(req,res) => {
    if(req.session.isAuth) {
        return res.redirect('/store');
    }
    res.render('register.ejs');
});

app.post("/login", async(req,res) => {
    try {
        const {email, password, remember} = req.body;
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).json("A user using this eMail does not exist!");
        } else {
            const passwordsMatch = await bcryptjs.compare(password, user.password);
            if(!passwordsMatch) {
                return res.status(404).json("The password does not match this account!");
            }
        }
        req.session.isAuth = true; //save the following fields for the current session (for **convience)
        req.session.email = email;
        req.session.cart = user.cart;
        req.session.wallet = user.wallet;
        req.session.isAdmin = user.admin;
        req.session.purchases = user.purchases;
        const time = new Date(); //the date now (starting from 1970)
        const year = time.getFullYear();
        const month = time.getMonth() + 1; //0-11
        const day = time.getDate();
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        await userModel.updateOne({email: req.session.email},{$push:
                {login:`${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`}}); //the first field is what I am looking for
        if(remember) {
            req.session.cookie.maxAge = yearInMs;
        }
        res.status(200).json("Login successful!");
    } catch(error) {
        res.status(404).json(error);
    }
});

app.post("/register", async(req,res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        let admin = false;
        let user = await userModel.findOne({email});
        if(user) {
            res.status(404).json("A user using this eMail address already exists!");
        } else {
            if(email === "admin") {
                admin = true;
            }
            const hashedPassword = await bcryptjs.hash(password, 10); //10 rounds of hashing
            user = new userModel({
                email: email,
                password: hashedPassword,
                admin: admin,
                wallet: 0
            });
            await user.save();
            res.status(200).json("User successfully created!");
        }
    } catch(error) {
        res.status(404).json(error);
    }
});

app.put("/addToCart", isAuth, async(req,res) => {
    try {
        const productName = req.body.name;
        const productInDB = await productModel.findOne({name: productName});
        if(productInDB.quantity <= 0) {
            return res.status(404).json("This product is out of stock!")
        }
        if(productInDB) {
            await productModel.updateOne({name: productName}, {$inc: {quantity:-1}});
            let user = await userModel.findOne({email: req.session.email});
            let cart = user.cart;
            let bool = false;
            let amount = 0;
            for(let i = 0; i < cart.length; i++) {
                if(cart[i].name === productName) {
                    bool = true;
                    amount = cart[i].quantity;
                    break;
                }
            }
            if(bool) {
                await userModel.updateOne({email: req.session.email},
                    {$pull: {cart: {name:productInDB.name}}});
            }
            await userModel.updateOne({email: req.session.email},
                {$push: {cart: {name:productInDB.name,
                            price:productInDB.price, photo:productInDB.photo, quantity: amount + 1}}});
            user = await userModel.findOne({email: req.session.email});
            req.session.cart = user.cart; //req.session.cart is now updated according to the user.cart in the db
            return res.status(200).json("Product was added to cart successfully!");
        }
    } catch(error) {
        res.status(404).json(error);
    }
});

app.post("/removeFromCart/:item", isAuth, async(req,res) => {
    try {
        const productName = req.params.item;
        const productInDB = await productModel.findOne({name: productName});
        let user;
        if(productInDB) {
            await productModel.updateOne({name: productName}, {$inc: {quantity:+1}});
            user = await userModel.findOne({email: req.session.email});
            const cart = user.cart;
            let amount = 0;
            for(let i = 0; i < cart.length; i++) {
                if(cart[i].name === productName) {
                    amount = cart[i].quantity;
                    break;
                }
            }
            await userModel.updateOne({email: req.session.email},
                {$pull: {cart: {name:productInDB.name}}});
            if(amount > 1) {
                await userModel.updateOne({email: req.session.email},
                    {$push: {cart: {name:productInDB.name,
                                price:productInDB.price, photo:productInDB.photo, quantity: amount - 1}}});
            }
            user = await userModel.findOne({email: req.session.email});
            req.session.cart = user.cart;
            res.status(200).redirect('../cart');
        }
    } catch(error) {
        res.status(404).json(error);
    }
});

app.get("/store", isAuth, (req,res) =>{
    res.render("store.ejs", { email : req.session.email });
});

app.get("/cart", isAuth, async(req,res) => {
    try {
        const user = await userModel.findOne({email:req.session.email});
        const userCart = user.cart;
        res.render("cart.ejs", { email : req.session.email, cart : userCart});
    } catch(error) {
        res.status(404).json(error);
    }
});

app.get("/logout", async(req,res)=>{
    const time = new Date();
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    await userModel.updateOne({email: req.session.email},{$push:
            {logout:`${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`}});
    req.session.destroy(() => { //express func to remove the session from the database
        res.redirect("/login");
    });
});

app.get("/admin",isAdmin, async(req,res) => {
    try {
        const users = await userModel.find({}); //saves in "users" all the users in the db
        res.render('admin.ejs', {email : req.session.email, users: users});
    } catch(error) {
        res.status(404).json(error);
    }

});

app.get("/recommendation",isAuth, (req,res) => {
    res.render('recommendation.ejs', {email : req.session.email});
});

app.get("/contact",isAuth, (req,res) => {
    res.render('contact.ejs', {email : req.session.email});
});

app.post("/contact",isAuth, async(req,res) => {
    try {
        const {name, country, content} = req.body;
        await userModel.updateOne({email: "admin"}, {$push:{messages: {name: name, country: country, content: content}}});
        res.status(200).json("Message sent to admin!");
    } catch(error) {
        res.status(404).json(error);
    }
});

app.get("/checkout", isCartEmpty, (req,res) => { //can't enter checkout if your cart is empty
    res.render('checkout.ejs', {email : req.session.email});
});

app.post("/checkout",isAuth, async(req,res) => {
    try {
        const useWallet = req.body.wallet;
        if(useWallet) {
            await userModel.updateOne({email: req.session.email}, {wallet: 0});
        }
        await userModel.updateOne({email: req.session.email}, {$push:{purchases: {Purchase: req.session.cart}}});
        await userModel.updateOne({email: req.session.email}, {cart: []});
        res.status(200).json("Purchase successful!");
    } catch(error) {
        res.status(404).json(error);
    }
});

app.get("/account",isAuth, (req,res) => {
    res.render('account.ejs', {email : req.session.email, wallet : req.session.wallet});
});

app.put("/account",isAuth, async(req,res) => {
    try {
        const hashedPassword = await bcryptjs.hash(req.body.password, 10);
        await userModel.updateOne({email: req.session.email}, {password: hashedPassword});
        res.status(200).json("Password changed!");
    } catch(error) {
        res.status(404).json(error);
    }

});

app.get("/top",isAuth, (req,res) => {
    res.render('top.ejs', { email : req.session.email});
});

app.get("/giftcard",isAuth, (req,res) => {
    res.render('giftcard.ejs', { email : req.session.email});
});

app.get("/readme.html", (req,res) => {
    res.render('readme.html');
});

app.post("/giftcard",isAuth, async(req,res) => {
    try {
        let user = await userModel.findOne({email: req.body.mail});
        if(!user) {
            return res.status(404).json("This user does not exist!");
        }
        const currentUser = await userModel.findOne({email: req.session.email});
        const currentMoney = currentUser.wallet;
        if(currentMoney < req.body.amount) {
            return res.status(404).json("Not enough money in your wallet!");
        }
        await userModel.updateOne({email: req.session.email}, {$inc: {wallet:-req.body.amount}});
        await userModel.updateOne({email: req.body.mail}, {$inc: {wallet:+req.body.amount}});
        req.session.wallet = currentMoney - req.body.amount;
        res.status(200).json("Money sent!");
    } catch(error) {
        res.status(404).json(error);
    }
});

app.get("/messages",isAdmin, async(req,res) => {
    const user = await userModel.findOne({email:"admin"});
    const adminMessages = user.messages;
    res.render('messages.ejs', {email : req.session.email, messages: adminMessages});
});

app.listen(5000,() => console.log("Server running on http://localhost:5000"));