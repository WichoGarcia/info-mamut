const express = require('express');
const app = express();
const User = require("../models/usuario");
const Comment = require("../models/comment");
const Artwork = require("../models/artwork");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const verify = require("../middlewares/verifyToken");

var usuarioActual;

app.get('/', async function(req,res){
    res.render('index',{valido:'',autenticar:''});
    });

app.post('/',async function(req,res){
    var usuario = req.body.usuario;
    var passwordI = req.body.password;



    User.findOne({usuario},async function(err,user){
        if(err){
            res.render('',{autenticar:'no',valido:''});
        }
        else if(!user){
            res.render('',{autenticar:'',valido:'no'});
        }
        else{
            isCorrectPassword(passwordI,user.password,(err,result)=>{
                if(err){
                    res.render('',{autenticar:'no',valido:''});
                }
                else if(result){
					usuarioActual= usuario;
					var token = jwt.sign({id:user.usuario,permission:true},process.env.SECRET,{expiresIn: "1h"});
					res.cookie("token",token,{httpOnly: true});

                    res.redirect("/menu");
                }
                else{
                    res.render('',{autenticar:'',valido:'no'});
                }
            });
        }
    });
});

app.get('/logout', (req,res)=>{
	res.cookie("token","",{
	  maxAge:-1
	}) ;
	res.redirect('/');
})

app.get('/signUp', function(req,res){
res.render('signUp',{repetido:'Registro'});
})
app.post('/signUp',async function(req,res){
    bcrypt.hash(req.body.password,10, async function(err,hashedPass){
        if(err){
            next(err);
        }
        else{
            var usuario = new User({
                nombre: req.body.nombre,
                usuario: req.body.usuario,
                correo: req.body.correo,
                password: hashedPass
                
            });
            await usuario.save(err =>{
                if(err){
                    res.render('signUp', {repetido:''});
                }
                else{
                    res.redirect("/");
                }
            });
        }
    });
})


app.get("/menu",verify,function(req,res){
    res.render("menu");
})

var selection = undefined;
var comes_from_selection = false;
var user_id = 0;
var comment_to_edit = undefined;

//////////////////////////////////////
app.get("/solar",verify,function(req,res){
	res.render("vuelos", {repetido:'Registro'});	
})
//////////////////////////////////////
app.post('/view_img', verify,(req, res) => {
	var img_name = req.body.img;
	var docs = Artwork.find({gallery: "solar"});

	comment_to_edit = undefined;

	Artwork.find({work_title: img_name}, async (error, doc) => {
		if (error)
			console.log(error);
		else {
			selection = doc[0];
			comes_from_selection = true;
			res.redirect('/solar');
		}
	});
});

app.post('/publishComment',verify, async (req, res) => {
	var msg = req.body;

	if (msg.comment) {
		var comment = msg.comment;

		Comment.find({
			artwork: selection.work_title,
			user: usuarioActual // Cambiar a usuario actual
		}, async (error, docs) => {
			if (error)
				console.log(error);
			else {
				var can_publish = docs.length == 0;

				if (can_publish) {
					var new_comment = new Comment({
						text: comment,
						user: usuarioActual, // Cambiar a usuario actual
						artwork: selection.work_title
					});

					await new_comment.save((error) => {
						if (error) console.log(error)
					});
				}
			}
		});
	} else if (msg.update_comment) {
		await Comment.updateOne({
			artwork: comment_to_edit.artwork,
			user: comment_to_edit.user
		}, {
			text: msg.update_comment
		});

		comment_to_edit = undefined;
	}

	comes_from_selection = true;
	res.redirect('/solar');
});

app.post('/comment_change',verify, async (req, res) => {
	var msg = req.body;

	if (msg.edit) {
		var comment_id = msg.edit.split(',');
		comes_from_selection = true;

		Comment.find({
			artwork: selection.work_title,
			user: usuarioActual // Cambiar a usuario actual
		}, (error, doc) => {
			if (error)
				console.log(error);
			else
				comment_to_edit = doc[0]
		});

	} else if (msg.delete) {
		var comment_id = msg.delete.split(',');
		comes_from_selection = true;

		Comment.deleteOne({
			user: comment_id[0], 
			artwork: comment_id[1]
		}, (error) => {
			if (error)
				console.log(error);
		});
		
	} else 
		console.log("Error: request not valid");

	res.redirect('/solar');
});

function isCorrectPassword(passwordI,password,callback){
    bcrypt.compare(passwordI,password,function(err,same){
        if(err){
            callback(err);
        }
        else{
            callback(err,same);
        }
    });
}
module.exports = app;
