const express = require('express');
const mongoose = require('mongoose')
const app = express();
const User = require("../models/usuario");
const Vuelo = require("../models/vuelo")
const Comment = require("../models/comment");
const Artwork = require("../models/artwork");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const verify = require("../middlewares/verifyToken");
const { text } = require('express');

var usuarioActual;
var tipoUser;



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
                    tipoUser=user.tipo
					console.log(user.tipo)
					if(user.tipo=="admin"){
						res.redirect("/administrador")
					}
					else{
                    res.redirect("/menu");
					}
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
                password: hashedPass,
				tipo: "usuario"
                
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

app.get("/administrador",verify,function(req,res){
    if(tipoUser=="admin"){
        res.render("admin")
    }
    else{
        res.redirect("/logout")
    }
	
})

app.get("/registrarVuelo",verify,function(req,res){
    if(tipoUser=="admin"){
        res.render("registroVuelo")
    }
    else{
        res.redirect("/logout")
    }
    
})

app.post("/registrarVuelo",verify,async function(req,res){
    if(tipoUser=="admin"){
        var vuelo = new Vuelo({
        numVuelo : req.body.numVuelo,
        aerolinea: req.body.aerolinea,
        ciudadOrigen : req.body.ciudadorigen,
        ciudadDestino : req.body.ciudaddestino,
        fSalida : req.body.fsalida,
        horaSalida: req.body.hsalida,
        minutoSalida: req.body.msalida
    })
    await vuelo.save(err =>{
        if(err){
        }
        else{
            res.redirect("/administrarVuelos")
        }
    })
    }
    else{
        res.redirect("/logout")
    }
    
})

app.get("/administrarVuelos",verify,function(req,res){
    if(tipoUser=="admin"){  
          Vuelo.find({}, function(err, vuelos) {
        if (err){
            console.log(err);
        }else{
            res.render('adminVuelos', { data: vuelos});
            }
        });
    }
    else{
        res.redirect("/logout")
    }

})

app.post("/:id/delete",verify,async(req,res)=>{
    if(tipoUser=="admin"){
        try{
            await Vuelo.findByIdAndDelete(req.params.id);
            res.redirect("/administrarVuelos")
        }
        catch(err){
            console.log(err)
            res.redirect("/administrarVuelos")
        }
    }
    else{
        res.redirect("/logout")
    }

})

app.get("/apivuelos",verify,function(req,res){
    if(tipoUser=="admin"){
        Vuelo.find({}, function(err, vuelos) {
            if (err){
                console.log(err);
            }else{
                res.render('apiVuelos', { data: vuelos});
                }
            });
    }
    else{
        res.redirect("/logout")
    }

})

app.get("/menu",verify,function(req,res){
    res.render("menu");
})

var selection = undefined;
var comes_from_selection = false;
var user_id = 0;
var comment_to_edit = undefined;



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
