var mongoose = require('mongoose')
var treeDataStructureSchema = new mongoose.Schema({
	folderName:{
		type:String,
		index:{unique:true},
	},
		metadata:{
			folderpath:{
				type:String,
				default:''
		},
		parent:{
			type:String,
			default:'',
		},
		isDirectory:{
				type:Boolean,
				default:true
			}
	}
})

var Folder = mongoose.model('treeDataStructure',treeDataStructureSchema)

module.exports = {
	Folder
}