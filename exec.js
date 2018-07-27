var express = require('express')
var app = express()
var cors = require('cors')
var fs = require('fs')
var bodyParser = require('body-parser')
var path = require('path')
var formidable = require('formidable')

process.on('uncaughtException',(err)=>{
	console.log(err,'AN ERROR OCCURRED. NODE NOT EXITING')
})

var port = parseInt(process.env.PORT || 3456)   
app.listen(port,()=>{console.log(`Listening on port ${port}`)})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
app.use(express.static('./'))

app.get('/',(req,res)=>{
	res.sendFile(path.resolve(path.join(__dirname,'home.html')))
})

app.post('/api/upload',(req,res)=>{
	let form = new formidable.IncomingForm()
	form.parse(req,(err,fields,files)=>{
		if(files.resource){
			console.log('file uploaded')
			var oldPath = files.resource.path
		var newPath = path.resolve(path.join(__dirname,'uploads',fields.path,files.resource.name))
		
		fs.rename(oldPath,newPath,(err)=>{
		if(err) throw err;
		console.log('file uploaded and moved')
		res.status(200).json({message:'file uploaded and moved'})
		})
		}else{
			console.log('file NOT uploaded',files)
				res.status(500).send('500:Internal server Error')
		}	
	})	
})

const getResources = (filepath)=>{
	return new Promise((resolve,reject)=>{
					let resolvedPath = path.resolve(path.join(__dirname,'uploads',filepath))
						fs.readdir(resolvedPath,(err,files)=>{
					if(err) reject(err)
						if(typeof files == 'undefined') reject(err)
						let fileArray = files.map((f,i)=>{
						let newPath = path.resolve(path.join(__dirname,'uploads',filepath,f))
							try{
							let stats = fs.statSync(newPath)
							if(stats.isDirectory()){
							return {name:f,type:'directory',filepath:`${filepath}/${f}`}
							}else{
							return {name:f,type:'file',filepath:`${filepath}/${f}`}
							}
							}catch(err){
								reject(err) 
							}	
					})
					resolve(fileArray)
				})
			
	})
}

const deleteResource =(filepath)=>{
return new Promise((resolve,reject)=>{
	if(!filepath || !filepath.trim()) reject('No path given')
	fs.unlink(path.resolve(filepath),(err)=>{
		if(err) reject(err)
		resolve('File deleted')
	})
})
}

app.get('/api/d',(req,res)=>{
	if(!req.query.path || !req.query.path.trim()){

	}else{
		deleteResource()
			.then((res)=>{
				res.status(200).json({result})
			}).catch((err)=>{
				res.status(500).send('500:Internal server Error')
		})
	}
})

app.get('/api/isdirectory',(req,res)=>{
	let filepath = req.query.path || 'resources'
	isDirectory(filepath)
		.then((result)=>{
		res.status(200).json({result})
		}).catch((err)=>{
			res.status(500).json({error:err})
		})
})

app.get('/api/resources',(req,res)=>{
	console.log('fetching resources....')
	let filepath = req.query.path || 'resources'
	getResources(filepath)
		.then((result)=>{
			res.status(200).json({data:result})
		})
		.catch((err)=>{
			res.status(500).send('500:Internal server Error')
		})
})

app.get('*',(req,res)=>{
	res.sendFile(path.resolve(path.join(__dirname,'404.html')))
})



