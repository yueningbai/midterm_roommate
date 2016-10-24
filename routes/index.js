var express = require('express');
var router = express.Router();
var User = require("../models/user")
var Rate = require("../models/rate")
/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log("Cookies :  ", req.cookies['name']);
  res.render('index', { title: 'Express' });
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Personal Infomation' });
});
router.get('/liked', function(req, res, next) {
  var r = req.query.q;
  switch(r){
    case '0':
      var cond = {'score':'desc',};
      break;
    case '1':
      var cond = {'score': 'asc',};
      break;
    case '2':
      var cond = {'age':'desc',};
      break;
    case '3':
      var cond = {'age':'asc',};
      break;
    default:
      var cond = {};

  }
  var username = req.cookies['name'];
  if(!username){
    res.redirect('/');
  }
  Rate.find({'username':username}).sort(cond).populate('tid').exec(function(err,re){
  var lists = new Array();
  if (err) {
    console.log(err);
    return;
  }else
  {
   
    for(var i=0;i<re.length;i++)
    {
      var sex;
      switch(re[i]['tid']['gender'])
      {
            case 0:
              sex = "Male";
              break;
            case 1:
              sex = "Female";
              break;
            default:
              sex = "Others";
      }
      var tags_list = new Array();
      tags_list = re[i]['tid']['tags'].split("#");
      var tags_dic ={
       1:"Pets lover",
       2:"Party a lot",
       3:"Quite",
       4:"Smoker",
       5:"Early Bird",
      };
      var tags_end = new Array();
      var k=0;
      for(var j=0;j<tags_list.length;j++)
      {
        if(tags_list[j]!=""){
          tags_end[k] = tags_dic[tags_list[j]];
	  k++;
	}
      }
      var stars = new Array(); 
      for(var j=0;j<re[i]['score'];j++){
        stars[j]= 1;
      }
      lists[i]=
      {
        target:re[i]['target'],
	age:re[i]['tid']['age'],
	gender:sex,
        occupation:re[i]['tid']['occupation'],
        hometown:re[i]['tid']['hometown'],
	tags:tags_end,
        score:stars,
      };
    }

  }
     //console.log(lists);
     res.render('likeones', {'lists':lists});
     //console.log(lists);
       
  });
  //res.render('register', { title: 'Personal Infomation' });
});
router.post('/scores',function(req, res, next) {
  var username = req.cookies['name'];
  var target = req.query.target;
  if(!username || !target){
     res.redirect('/');
  }
  var score = 0;
  score = req.body.stars;
  
  User.findOne({'name':target},function(err,re){
      if (err) {
        console.log(err);
        return;
      }else
      {
         var age = re['age'];
         var infolist = 
         {
           tid : re['_id'],
           target: target,
           username: username,
           score: score,
	   age:age,
         };
         var rate = new Rate(infolist);
         Rate.count({'target':target,'username':username},function(err,re){
           if (err) {
             console.log(err);
             return;
           }else
           {  
             var usercount = re;
             if(usercount >0 && score > 0)
             {
               //console.log('have exist');
     
               Rate.update({'target':target,'username':username},{$set: {score: score,age:age}}, function(err) {
               if(err){
	         console.log(err);
                 return;
               }
               console.log('update success');
          
             });
             }else if(usercount <=0 && score > 0)
             {
               rate.save(function(err,rate){
               if (err) {
                 console.log(err);
               return;
             }
             //console.log('add success');
             //res.cookie('name', _name, {expire : new Date() + 600000});
             //console.log("Cookies :  ", req.cookies);
             });
            }
        //res.cookie('name', _name, {expire : new Date() + 600000});        
        //res.render('rate', { title: 'Rate' });
	res.redirect('/rate');
      }       
   });         
         //console.log('have exist');
      }
  });
  
  //console.log(target);
});
router.get('/whoami',function(req, res, next) {
  var username = req.cookies['name'];
  if(!username){
     res.redirect('/');
  }
  User.findOne({'name':username},function(err,re){
      if (err) {
        console.log(err);
        return;
      }else
      {
         
         var sex;
          switch(re['gender'])
           {
            case 0:
              sex = "Male";
              break;
            case 1:
              sex = "Female";
              break;
            default:
              sex = "Others";
          }
          /*get tags*/
          var tags_list = new Array();
          tags_list = re['tags'].split("#");
          var tags_dic ={
           1:"Pets lover",
           2:"Party a lot",
           3:"Quite",
           4:"Smoker",
           5:"Early Bird",
          };
          var tags_end = new Array();
          var k=0;
          for(var j=0;j<tags_list.length;j++)
          {
            if(tags_list[j]!=""){
              tags_end[k] = tags_dic[tags_list[j]];
	      k++;
	    }
          }  
          var info_=
          {
           id: re['id'],
           name: re['name'],
           age: re['age'],
           gender:sex,
           occupation:re['occupation'],
           hometown:re['hometown'],
           tags:tags_end,
          };
          //console.log(info_);
          res.render('myaccount',{ item : info_});
        //res.cookie('name', _name, {expire : new Date() + 600000});        
        //res.render('rate', { title: 'Rate' });
      }                
  });
  
  
});
router.post('/userinfo', function(req, res, next) {
  var _name = req.body.name;
  var _age = req.body.age;
  var _gender = req.body.inlineRadioOptions;
  var _occupation = req.body.occupation;
  var _hometown = req.body.hometown;
  var ops = new Array();
  var op;
  var _tags = '';
  ops[0] = req.body.inlineCheckbox0;
  ops[1] = req.body.inlineCheckbox1;
  ops[2] = req.body.inlineCheckbox2;
  ops[3] = req.body.inlineCheckbox3;
  ops[4] = req.body.inlineCheckbox4;
  for (op in ops)
  {
     if(ops[op])
     {
        _tags = ops[op] + "#" + _tags; 
     }
  }
  var timestamp=new Date().getTime();
  var userinfo_=
  {
     id: timestamp,
     name: _name,
     age: _age,
     gender:_gender,
     occupation:_occupation,
     hometown:_hometown,
     tags:_tags
  };
  var user = new User(userinfo_);
  var flag = 0;
  User.count({'name':_name},function(err,re){
     if (err) {
        console.log(err);
        return;
     }else
     {  
        var usercount = re;
        if(usercount >0)
        {
          //console.log('have exist');
          User.update({name: _name},{$set: {age: _age,gender:_gender,occupation:_occupation, 'hometown':_hometown,'tags':_tags}}, function(err) {
          if(err){
	    //console.log(err);
            return;
          }
          //console.log('update success');
          
          });
        }else
        {
          user.save(function(err,user){
          if (err) {
            console.log(err);
          return;
          }
          //console.log('add success');
          //res.cookie('name', _name, {expire : new Date() + 600000});
          //console.log("Cookies :  ", req.cookies);
          //res.send('注册成功');
          });
        }
        res.cookie('name', _name, {expire : new Date() + 600000});        
        //res.render('rate', { title: 'Rate' });
	res.redirect('/rate');
      }       
  });
  
  //res.render('register', { title: 'Personal Infomation' });
});

router.get('/rate', function(req, res, next) {
  var _name = req.cookies['name'];  
  if(!_name){
    res.redirect('/');
  }
  User.count({'name':_name},function(err,re){
    if (err) {
      console.log(err);
      return;
    }else
    {
      if(re<=0){
        clearCookie('name');
        res.redirect('/');
      }
      User.find({'name':{$ne:_name}},function(err,re){
        if (err) {
	  console.log(err);
	  return;
        }else
        {
          if(re.length<=0)
          {
            res.send('database is in empty,please run http://domain:3000/generateusers');
            return ;
          }
          var n=Math.floor(Math.random()*re.length+1)-1;
          console.log(re[n]['name']);
          /*get gender*/
          var sex;
          switch(re[n]['gender'])
           {
            case 0:
              sex = "Male";
              break;
            case 1:
              sex = "Female";
              break;
            default:
              sex = "Others";
          }
          /*get tags*/
          var tags_list = new Array();
          tags_list = re[n]['tags'].split("#");
          var tags_dic ={
           1:"Pets lover",
           2:"Party a lot",
           3:"Quite",
           4:"Smoker",
           5:"Early Bird",
          };
          var tags_end = new Array();
          var k=0;
          for(var j=0;j<tags_list.length;j++)
          {
            if(tags_list[j]!=""){
              tags_end[k] = tags_dic[tags_list[j]];
	      k++;
	    }
          } 
          var info_=
          {
           id: re[n]['id'],
           name: re[n]['name'],
           age: re[n]['age'],
           gender:sex,
           occupation:re[n]['occupation'],
           hometown:re[n]['hometown'],
           tags:tags_end,
          };
          res.render('rateone', info_);
	  //console.log(info_);
        }
      });
    }
  });
  console.log("rate");

  });
module.exports = router;
