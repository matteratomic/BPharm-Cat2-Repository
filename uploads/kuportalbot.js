let Nightmare = require('nightmare')
async function goToPortal (){
let nightmare = new Nightmare({show:true,typeInterval:70})
try{
await nightmare.goto('https://portal.ku.ac.ke/secure/student/StuPortal.aspx')
.type('#_ctl0_PlaceHolderMain_Loginstu1_txtLoginUsername','macharia.ian2')
.wait(200).type('#_ctl0_PlaceHolderMain_Loginstu1_txtLoginPassword',17863)
	.click('#_ctl0_PlaceHolderMain_Loginstu1_btnLoginLogin')

}catch(err){
	throw err
}

}
goToPortal()
