var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArtworkSchema = Schema({
	work_title:{
		type: String,
		required: true,
		unique:true
	},
	author:{
		type: String,
	},
	date:{
		type: String,
	},
	description:{
		type: String,
		required: true,
	},
	gallery:{
		type:String,
		required:true,
	},
	url:{
		type:String,
		required:true,
		unique:true
	}
});

module.exports = mongoose.model("artwork",ArtworkSchema);
