const axios         = require('axios').default;
const nodemailer    = require('nodemailer');
const fs            =require('fs');
const express       = require('express');
const app           = express();
const port          = 3000;
const bodyParser    =require('body-parser');
const {v4: uuidv4}  = require('uuid');
const { json }      = require('express');

app.use(express.static('public'));
require('dotenv').config();
//lectura de archivos
let roommates        = fs.readFileSync('roommates.json','utf-8')
let roommatesJson   = JSON.parse(roommates);
let gastos          = fs.readFileSync('gastos.json','utf-8')
let gastosJson      = JSON.parse(gastos)

//config. Email
var transporter     = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user : process.env.EMAIL,
        pass : process.env.PASSWORD
    }
})
//traer roommates
async function crearR(){
   try{
    let respuesta= await axios.get('https://randomuser.me/api');
    var integrante={
        nombre:respuesta.data.results[0].name.first,
        apellido: respuesta.data.results[0].name.last,
        email: respuesta.data.results[0].email,
        id:respuesta.data.results[0].login.uuid
    }
    return integrante;
   }catch(err){
    console.log(err.message);
   }finally{
    console.log('fin');
   }
}
//Agregar Roommates
app.use(bodyParser.urlencoded({extended: false}));
app.post('/agregar', async(req,res)=>{
    let peticion = await crearR();
    roommatesJson.push(peticion);
   fs.writeFile('roommates.json',JSON.stringify(roommatesJson),(err)=>{
        if(err){
            console.log(err.message);
        }else{
            res.redirect('/roommates')
        }
    }) 
})
//Mostrar Roommates
app.get('/roommates', (req, res) =>{
    let nombres= '';
    for(i=0;i<roommatesJson.length;i++){
        nombres+= ` <tr>
        <td>${roommatesJson[i].nombre}</td> 
        <td>${roommatesJson[i].apellido}</td> 
        <td>${roommatesJson[i].email}</td>
        <td><a href="/eliminarRoommate/${roommatesJson[i].id}"><input type="submit" name="eliminarGasto" value="Eliminar" id="btnl"></a> </td></tr>`
    }
    fs.readFile('public/html/roommates.html',(err,data)=>{
        let html=data.toString().replace('usuarios','<table>'+nombres+'</table>');
        res.send(html);
    })
})
//Agregar gastos al historial
app.use(bodyParser.urlencoded({extended: false}));
app.post('/agregarGasto',(req,res)=>{
    let gasto ={
        id:uuidv4(),
        nombre:req.body.integrantes,
        descripcion:req.body.descripcion,
        monto:req.body.monto
    }
    
    if(req.body.integrantes && req.body.descripcion && req.body.monto){
        gastosJson.push(gasto);
        fs.writeFile('gastos.json',JSON.stringify(gastosJson),(err)=>{
            if(err){
                res.send(err.message); 
            }else{
                var mail = {
                to: process.env.EMAIL,
                from: 'roommates@gmail.com',
                subject:  'Nuevo gasto agregado',
                text: 'Lista de Gastos Actualizada',
                attachments:{
                    filename:'gastos.json',
                    path: 'gastos.json'
                }
            }
            transporter.sendMail(mail,(err,res)=>{
                if(err){
                    console.log(err.message)
                }else{
                    console.log('E-mail enviado');
                }
            }) 
                res.redirect('/historial?');
            }
        })
    }else{
        res.send('Complete todos los campos para ingresar el gasto')
    }
})
//traer integrantes al select
app.get('/', (req, res) =>{
    let nombres= '';
    for(i=0;i<roommatesJson.length;i++){
        nombres+='<option>'+roommatesJson[i].nombre+'</option>';
    }
    var nombresR= '';
    fs.readFile('public/html/vista.html',(err,data)=>{
        let html=data.toString().replace('usuarios',nombres);
        res.send(html);
    })
})
//traer gastos
app.get('/historial', (req,res)=>{
    fs.readFile('gastos.json',(err,data)=>{
        if(err){
            res.send(err.message);
        }else{
            let g='';
          for(i=0;i<gastosJson.length;i++){
                g+= `
                <tr id=${gastosJson[i].id}>
                <td>${gastosJson[i].descripcion}</td> 
                <td>${gastosJson[i].monto}</td> 
                <td>${gastosJson[i].nombre}</td>
                <td> <a href="/editar/${gastosJson[i].id}"><input type="submit" name="eliminarGasto" value="Editar" id="btnEditar"></a>
                <a href="/eliminarGasto/${gastosJson[i].id}"><input type="submit" name="eliminarGasto" value="Eliminar" id="btnEliminar"></a> </td></tr>`
            } 
           fs.readFile('public/html/historialgastos.html',(err,data)=>{
                let html=data.toString().replace('<table></table>','<table>'+g+'</table>');
                res.send(html);
            }) 
        }
    })
}) 
//editar gasto
app.get('/editar/:id',(req,res)=>{
  fs.readFile('public/html/edit.html',(err,data)=>{
       if(err){
        res.send(err.message)
       }else{
        let id      = req.params.id;
        let datos   = "";
        let gasto   = gastosJson.filter(g =>{

        if( g.id == id ){
            return datos += `<tr><form action="guardar" method="post"><input name="id" type="text" value="${g.id}" style="display:none">
            <input name="descripcion" type="text" value="${g.descripcion}" placeholder="Descripción">
            <input name="monto" type="tesxt" value="${g.monto}" placeholder="Monto">
            <input name="nombre" type="tesxt" value="${g.nombre}" placeholder>
            <a href="/editar/guardar"><input type="submit" value="Guardar cambio" id="btnEditar"></a>
            <a href="/historial"><input type="submit" name="eliminarGasto" value="volver" id="btnEliminar"></a></form></tr>`
        }
       })
            let html    =   data.toString().replace('usuarios',datos);
            res.send(html);
       }
   })  
})
app.post('/editar/guardar',(req,res)=>{
    let id      = req.body.id;
    gastosJson  = gastosJson.filter(g=>{
        return g.id != id
    })
    let query   ={
        id : req.body.id,
        nombre: req.body.nombre,
        descripcion : req.body.descripcion,
        monto : req.body.monto
    }
    gastosJson.push(query)
    fs.writeFile('gastos.json',JSON.stringify(gastosJson),(err)=>{
        if(err){
            res.send(err.message); 
        }else{
            res.redirect('/historial');
        }
    })
})
//eliminar gasto
app.get('/eliminarGasto/:id', (req,res)=>{
    var ruta= req.params.id;
    gastosJson=gastosJson.filter(elemento=>{
        return elemento.id != ruta;
    })
    fs.writeFile('gastos.json',JSON.stringify(gastosJson),(err)=>{
        if(err){
            console.log(err.message);
        }else{
           if(gastosJson==""){
            res.redirect('/')
           }else{
            res.redirect('/historial?')
           }
        }
    }) 
}) 
//eliminar roommate
app.get('/eliminarRoommate/:id', (req,res)=>{
    var ruta        = req.params.id;
    roommatesJson   =roommatesJson.filter(elemento=>{
        return elemento.id != ruta;
    })
    fs.writeFile('roommates.json',JSON.stringify(roommatesJson),(err)=>{
        if(err){
            console.log(err.message);
        }else{
          if(roommatesJson==""){
                res.redirect('/')
            }else{
                res.redirect('/roommates')
            }
        }
    })
}) 
app.listen(port, () => console.log(`Example app listening on port ${port}!`))