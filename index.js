var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser : true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs"); 

//Schema Setup
var campgroundSchema = new mongoose.Schema({
    name : String,
    image : String,
    description : String
});

var Campground = mongoose.model("Campground",campgroundSchema);

// Campground.create(
//     {name:"Taj Mahal", image : "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"},
//     {name:"Eiffel Tower", image : "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/ab/3e.jpg"},function(err, campground){
//         if(err)
//             console.log(err)
//         else
//          {   console.log("New Created Campground");
//             console.log(campground);}
//     });  

// var campgrounds = [
//     {name:"India Gate", image : "https://cdn.britannica.com/38/189838-050-83C7395E/India-War-Memorial-arch-New-Delhi-Sir.jpg"},
//     {name:"Taj Mahal", image : "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"},
//     {name:"Eiffel Tower", image : "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/ab/3e.jpg"}
// ]

app.get("/",function(req,res){
	res.render("landing" );
})

app.get("/campgrounds", function(req , res){
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log(err);
        }
        else
            res.render("index.ejs",{campgrounds:allCampgrounds});
    });
});

app.post("/campgrounds",function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = {name:name,image:image}
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
	res.render("new.ejs")
})

//SHOW
app.get("/campgrounds/:id", function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err)
            console.log(err);
        else
            res.render("show.ejs",{campground: foundCampground});
    });
    res.render("show.ejs");
});

app.listen(3000,function(){
	console.log("Project Server is Started at 3000...");
});