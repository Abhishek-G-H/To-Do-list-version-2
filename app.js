//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewURLParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemSchema);

const item1= new Item ({
  name: "Welcome to Your ToDolist!"
});

const item2= new Item ({
  name: "Click the + button to add a new item."
});

const item3= new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Succesfully inserted default items.");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }).catch(function(err){
    console.log(err);
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.listButton;

  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }
});

app.post("/delete",function(req,res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.deleteOne({_id: itemId}).then(function(){

    }).catch(function(err){
      console.log(err);
    });
  
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: itemId}}}).then(function(foundList){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}).then(function(foundItem){
    if(!foundItem){
      // create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      // show an exixting list
      res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items});
    }
  }).catch(function(err){
    console.log(err);
  });
  
  

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
