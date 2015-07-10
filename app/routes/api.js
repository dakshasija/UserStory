var User = require('../models/user');
var config = require('../../config');
var secretKey = config.secretkey;
var jsonwebtoken = require('jsonwebtoken');

var Story = require('../models/story');
function createToken(user) {

    var token = jsonwebtoken.sign({

        id: user._id,
        name: user.name,
        username: user.username

    }, secretKey, {
        expiresinMinutes: 1440

    });

    return token;

}

module.exports = function(app, express,io) {

    var api = express.Router();

   api.get('/all_stories',function(req,res){
    Story.find({},function(err,stories){
        if(err)
        {
            res.send(err);
            return;
        }
        res.json(stories);
    });
   });



    api.post('/signup', function(req, res) {

        var user = new User({

            name: req.body.name,
            username: req.body.username,
            password: req.body.password

        });
        var token = createToken(user);

        user.save(function(err) {

            if (err) {

                res.send(err);
                return;
            }
            res.json({
                success: true,
                message: "user successfully created",
                token: token
            });

        });
    });

    api.get('/users', function(req, res) {

        User.find({}, function(err, users) {
            if (err) {
                res.send(err);
                return;
            }

            res.json(users);
        });

    });

    api.get("/test", function(req, res) {
        console.log("inside test");
        res.send("hello world");
    })

    api.post('/login', function(req, res){
        console.log(req.body);
        User
            .findOne({username: req.body.username})
            .select('name username password')
            .exec(function(err, user){
                console.log(user);
                if (err)
                    throw err;
                if (!user) {
                    res.send({
                        message: "User doesnt exist!"
                    });
                } else if (user) {
                    var validPassword = user.comparePassword(req.body.password);
                    console.log(validPassword);
                    if (!validPassword) {
                        res.send({
                            message: "Invalid password"
                        });
                    }
                    else {
                        var token = createToken(user);
                        res.json({
                            success: true,
                            message: "Successfully logged in",
                            token: token,
                        });
                    }
                }; 
            })
    });


 api.use(function(req, res, next){

    console.log("Somebody just came to our app");

  var token = req.body.token || req.param('token') || req.headers['x-access-token'];

  if(token){

    jsonwebtoken.verify(token, secretKey,function(err,decoded){


   if(err){
    res.status(403).send({success: false,message:"Failed to authenticate user"});
   }
else
{

    req.decoded = decoded;


    next();
}




    });
  }
  else
  {

res.status(403).send({success: false,message:"No token found"});


  }




          });



 //--------------------- just a checkpoinr. We actually need to route a user after this middleware.-----------------------------------------------

// api.get('/', function(req,res){

// res.json("Hello World");


// });

 // ----------------------------------------------------------------------------------------------------------------------------------


api.route('/')


.post(function(req,res){

   var story = new Story({
   
   creator: req.decoded.id,
   content: req.body.content

   
   });


story.save(function(err, newStory){
 if(err){

    res.send(err);
    return
 }

io.emit('story',newStory)

res.json({message: "New Story created"});

});

})

.get(function(req, res){

  Story.find({ creator: req.decoded.id},  function(err,stories){
if(err){
    res.send(err);
    return;
}

res.json(stories);



  });


});


   api.get('/me',function(req, res){

   res.json(req.decoded);
});





    return api


}
   



    // api.post('/login', function(req, res) {
    //         User.findOne({
    //             username: req.body.username,
    //         }).select('password').exec(function(err, user) {
    //             if (err)
    //                 throw err;

    //             if (!user) {


    //                 res.send({
    //                     message: "User doesnt exist!"
    //                 });
    //             } else if (user) {


    //                 var validPassword = user.comparePassword(req.body.password);
    //             } else if (!validPassword) {

    //                 res.send({
    //                     message: "Invalid password"
    //                 });

    //             } else {


    //                 var token = createToken(user);

    //                 res.json({

    //                     success: true,
    //                     message: "Successfully logged in",
    //                     token: token,
    //                 });
    //             }
    //         });
    //     }
