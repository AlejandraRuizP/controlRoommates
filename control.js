const axios= require('axios').default;
const express = require('express')
const app = express()
const port = 3000

var bodyParser=require('body-parser');
app.use(express.static('public'));
app.get('/', (req, res) => res.send('Hello World!'))
//--------------------------------------

app.use(bodyParser.urlencoded({extended: false}));
app.post('/agregar',(req,res)=>{
    let id=req.body.id;
    let nombre=req.body.nombre;
    res.send('Id:'+id +' '+ 'nombre:'+ nombre);
    console.log(id +'nombre:'+nombre);
})

app.use(bodyParser.urlencoded({extended: false}));
app.post('/gastos',(req,res)=>{
    let nombre=req.body.integrante;
    let descripcion=req.body.descripcion;
    let monto=req.body.monto;
    res.send('Roommate:'+ nombre+' '+ 'Descripcion:'+descripcion+' '+ 'Monto:'+monto);
    console.log(id+' '+nombre+' '+monto);
})

app.get('/',(req,res)=>{

})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))