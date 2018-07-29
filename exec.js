const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const conn = mongoose.connection
const bodyParser = require('body-parser')
const formidable = require('formidable') 
const {Folder} = require('./model.js')
const Gfs = require('gridfs-stream')
const fs = require('fs')
const childProcess = require('child_process')
const dburi = "mongodb://IanMacharia:paramecium1@ds113849.mlab.com:13849/mydatabase"
const port = parseInt(process.env.PORT || 1234,10)
let currentFolder = ''
app.use(bodyParser.json())
var randomRoute
const crypto = require('crypto')
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('./views'))
app.listen(port,()=>{console.log(`Listening on port ${port}`)})

mongoose.Promise = global.Promise
Gfs.mongo = mongoose.mongo
mongoose.connect(dburi,{useNewUrlParser:true})


setInterval(()=>{
		crypto.randomBytes(16,(err,buffer)=>{
		if(err){
			console.log(err)
		}
		randomRoute = buffer.toString('hex')
	})
},20000)

conn.once('open',(err)=>{

		const getFolderPath = (foldername)=>{
		return new Promise((resolve,reject)=>{
			Folder.findOne({folderName:foldername},(err,folder)=>{
				if(err){
					console.log(err)
					reject(err)
				}
				if(folder.metadata){
					resolve(folder.metadata.folderpath)
				}else{
					reject('File not found')
				}
			})
		})
	}


	app.get('/u:id',(res,req)=>{
		if(req.params.id == randomRoute){
					res.status(200).json({message:'You reached the route'})
		}else{
					res.status(200).json({message:'Incorrect password'})

		}
	})

	app.get('/api/createfolder',(req,res)=>{
		console.log('creating folder ',req.query.foldername)
		if(req.query.foldername){
			if(req.query.parent && req.query.parent.trim()){
				//use parent path to make child node path
				getFolderPath(req.query.parent)
					.then((parentpath)=>{
					let parent = req.query.parent
					let folderName = req.query.foldername
					let folder = new Folder({
						folderName,
						metadata:{
						folderpath:parentpath+"/"+folderName,
						parent}
					}) 

					folder.save((err,folder)=>{
						if(err){
						console.log(`${folderName} already exists`)
						res.status(500).json({error:`${folderName} already exists`})
						}else{
						console.log(`${folderName} was created successfully`)
						res.status(200).json({message:`${folderName} was created successfully`})
						}
					})
			}).catch(err=>console.log(err))
			}else{
					let folderName = req.query.foldername
					let folder = new Folder({
						folderName,
						metadata:{
						folderpath:"/"+folderName,
						parent:""}
					}) 
					
					folder.save((err,folder)=>{
						if(err){
						console.log(`${folderName} already exists`)
						res.status(500).json({error:`${folderName} already exists`})
						}else{
						console.log(`${folderName} was created successfully`)
						res.status(200).json({message:`${folderName} was created successfully`})
						}
					})
			}
		
		}else{
		res.status(400).json({error:`400:Bad Request`})
		}
	})

	app.get('/api/getpath',(req,res)=>{
		if(req.query.foldername && req.query.foldername.trim()){
			getFolderPath(req.query.foldername)
						.then((folderpath)=>{
							res.status(200).json({folderpath})	
						})
						.catch((err)=>{
							res.status(200).json({error:"Folder not found"})	
					})
		}else{
		res.status(400).json({error:'400:Bad request'})	
		}
	})

app.get('/authenticate',(req,res)=>{
	if(req.query.password ==='WindyRain73@'){
		res.status(200).json({secret:'Adrenocorticotropic1'})
	}else{
		res.status(200).json({error:'Incorrect password'})
	}
})

	app.get('/api/getfolder',(req,res)=>{
		let folderpath = req.query.path || '/resources'
		let query = {"metadata.path":req.query.path}
		Folder.find(query,(err,folders)=>{
			if(err){
			console.log(`Error getting folder`)
			res.status(500).json({error:`Error getting folder`})
			}else{
			console.log(folders)
			res.status(500).json({data:{
				folders
			}})
			}
		})
	})

	if(err) console.log(err)
		let gfs = Gfs(conn.db)
		console.log('ESTABLISHED CONNECTION TO DATABASE')

		app.get('/',(req,res)=>{
			/*let ip = req.ip
			childProcess.exec(`echo ${ip} >> ip.txt`,(err,res)=>{
				console.log(res)
			})*/
		res.sendFile(path.resolve(path.join('views','home.html')))
		})

		app.post('/api/upload',(req,res)=>{
				let form = new formidable.IncomingForm()
				form.parse(req,(err,fields,files)=>{
				let parent = fields.selectedFolder
				console.log('Uploading to '+parent)
					getFolderPath(parent)
					.then((parentpath)=>{
					let folderName = files.resource.name
					let folder = new Folder({
						folderName,
						metadata:{
						folderpath:parentpath+"/"+folderName,
						parent,
						isDirectory:false
					}
					}) 
					folder.save((err,folder)=>{
						if(err){
						console.log(`${folderName} already exists`)
						res.status(500).json({error:`${folderName} already exists`})
						}else{
						console.log(`Saved ${folderName} as folder but not as binary`)
						let writeStream = gfs.createWriteStream({
							filename:files.resource.name,
							mode:'w',
							metadata:{
								folderpath:parentpath+"/"+files.resource.name,
								parent,
								isDirectory:false
							}
						})
						let readStream = fs.createReadStream(path.resolve(files.resource.path),(err)=>{
							if(err){
							res.status(500).json(
								{error:'Internal server error'})	
							}
							console.log(`Making readstream from temp dir for ${folderName}`)

						})
						readStream.pipe(writeStream)

						writeStream.on('close',()=>{
							console.log(`Saved ${folderName} as as binary to database.....WERE DONE`)
							res.status(200).json(
								{data:{status:`${folderName} has been uploaded`}
								})
							})
						}
					})
			}).catch((err)=>{
						console.log(err)
						res.status(400).json({error:'Folder given does not exist'})
					})
				})	
			})

		app.get('/api/getresource',(req,res)=>{
			let fileName = req.query.filename
			let readStream = gfs.createReadStream({
				filename:fileName
			})
			readStream.on('error', function (err) {
			  console.log('An error occurred!', err);
			  throw err;
});	
			readStream.pipe(res)
		})

		app.get('/api/openfolder',(req,res)=>{		
			let query = req.query.foldername ? {"metadata.parent":req.query.foldername} : {"metadata.parent":'Resources'} 
			console.log(query)
			Folder.find(query,(err,files)=>{
				if(err){
					console.log(err)
					res.status(500).json({data:{
						error:err
					}})
				}
				res.status(200).json({data:{
					files
				}})
			})
		})


const deleteFolderOrFile = (foldername)=>{
return new Promise((resolve,reject)=>{
	Folder.remove({folderName:foldername},(err)=>{
		if(err){reject(err)}
			resolve(`${foldername} has been removed`)
	})
})
}


		app.get('/api/delete',(req,res)=>{
			let folderName = req.query.foldername
			deleteFolderOrFile(folderName)
				.then((message)=>{
					gfs.remove({filename:folderName}, function (err, gridStore) {
					  if (err) console.log(err);
					  res.status(200).json({message})
					});
				}).catch((err)=>{					 
				 res.status(500).json({error:'500:Internal server error'})
				}
					)
		})
})

conn.on('error',(err)=>{
	console.log(err)
})
conn.on('connecting', function() {
    console.log('connecting to MongoDB...');
  });
conn.on('reconnected', function () {
    console.log('MongoDB reconnected!');
  });
conn.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(dburi, {server:{auto_reconnect:true}});
  });
conn.on('connected', function() {
    console.log('MongoDB connected!');
  });


process.on('uncaughtException',(err)=>{
	console.log(err,'Node not exiting')
})