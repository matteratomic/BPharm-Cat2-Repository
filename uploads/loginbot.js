var Nightmare = require('nightmare')

var google = async(num)=>{
try{
var nightmare = new Nightmare({show:true,typeInterval:500})
for(var i = 0 ; i < 10 ; i++){
	await nightmare.goto('http://192.168.0.17:3000/chat')
.type('#message','Ian Macharia is awesome')
.click('button#send')
}
}catch(e){
console.error(e)
}
}


google()
