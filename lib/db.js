/*
 * Database table
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Table = new Schema({
	ID: Schema.Types.ObjectId,
	Username: String,
	Audio_file: String,
	Txt_file: String,
	CreateDate: String
});

mongoose.model('Table', Table);
mongoose.connect('mongodb://localhost/project');