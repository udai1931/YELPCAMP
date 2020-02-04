var express       = require("express");
var app           = express();
var bodyParser    = require("body-parser");
var mongoose      = require("mongoose");
var passport      = require("passport");
var LocalStrategy = require("passport-local");
var Campground    = require("./models/campground");
var seedDB        = require("./seed.js");
var Comment       = require("./models/comment");
var User          = require("./models/user");

mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser : true});
mongoose.set('useUnifiedTopology',true);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs"); 
app.use(express.static(__dirname + "/public"));
//SEEDING DATA
seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret : "It is used in hashing the password",
    resave : false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/",function(req,res){
	res.render("landing" );
})

app.get("/campgrounds", function(req , res){
    //console.log(req.user);
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log(err);
        }
        else
            res.render("campgrounds/index.ejs",{campgrounds:allCampgrounds, currentUser : req.user});
    });
});

app.post("/campgrounds",function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description
    var newCampground = {name:name,image:image,description:description}
    Campground.create(newCampground , function(err, newlyupdated){
        if(err)
            console.log(err);
        else
        {
            res.redirect("/campgrounds");  
        }
    });
    //campgrounds.push(newCampground);
    //res.redirect("/campgrounds");
});

app.get("/campgrounds/new",function(req , res){
	res.render("campgrounds/new.ejs")
})

//SHOW
app.get("/campgrounds/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err)
            console.log(err);
        else
            res.render("campgrounds/show.ejs",{campground : foundCampground});
    });
    //res.render("show.ejs");
});


//======================
//COMMENTS ROUTESS
//======================

app.get("/campgrounds/:id/comments/new", isLoggedIn ,function(req,res){
    Campground.findById(req.params.id, function(err,campground){
    if(err)
    console.log(err);
    else{
         res.render("comments/new",{campground:campground});   
    }    
    })
});

app.post("/campgrounds/:id/comments%3E",isLoggedIn , function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            /*var text = req.body.text;
            var author = req.body.author;
            var newComment = {text:text,author:author};*/
            Comment.create(req.body.comment , function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/'+campground._id);
                }
            });
        }
    })    
});

//AUTH ROUTES

//register form
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    var newUser = new User({username:req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds");
        }
        );
    });
});

//login
app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("local",
    {
        successRedirect : "/campgrounds",
        failureRedirect : "/login"
    }),function(req,res){
});

//logout
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});

function isloggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000,function(){
	console.log("Project Server is Started at 3000...");
});