async function traerDAtos(){
    let datos = await fetch ('http://127.0.0.1:5500/test.json');
    let res = await datos.json();
    res.map(n=>console.log(n.nombre))
    console.log(res);
}
traerDAtos();