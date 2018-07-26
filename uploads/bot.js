var Nightmare = require('nightmare')

var google = async()=>{
try{
var nightmare = new Nightmare({show:true,typeInterval:100})
await nightmare.goto('http://192.168.0.17:3000/login')
.type('#name','Ian Macharia')
.type('#password','paramecium')
.click('#login').evaluate(()=>{
alert('script done')
})
}catch(e){
console.error(e)
}
}

google()
