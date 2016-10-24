var mongoose=require('mongoose');
var UserSchema=new mongoose.Schema({
  id:{unique:true,type:Number},
  name:{unique:true,type:String},
  age:Number,
  gender:Number,
  occupation:String,
  hometown:String,
  tags:String,
    })
  module.exports=UserSchema;
