var mongoose=require('mongoose');
var RateSchema=require('../schemas/rate');
var Rate=mongoose.model('Rate',RateSchema);
module.exports=Rate;
