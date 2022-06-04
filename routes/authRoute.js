const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('./../models/user.js')


router.get('/login',(req,res)=>{

    res.render('login');
})


router.post('/register',async (req,res)=>{
    try{
        const {name,email,password} = req.body;
        
        const foundUser = await User.findOne({email:email});
        if(foundUser){
            console.log(foundUser)
            res.redirect('/auth/login');
        }else{
            console.log(foundUser)
            const saltRounds = 10;
            const becryptedPassword = bcrypt.hashSync(password, saltRounds);
            const username = email.split('@')[0];
            let pic = Math.floor(Math.random()*10 + 1)+".png"
            const newUser = new User({ 
                pic:pic,
                name: name,
                password: becryptedPassword,
                username:username,
                email: email
                });
            console.log(newUser)
            newUser.save(function (err) {
                if (err) {
                    console.log('yaha')
                    console.log(err);
                // req.flash('title','danger');
                // req.flash('message',`There should be atleast 3 members in a Team`)
                return res.redirect("/auth/login")      //TODO
                }else{
                    // req.flash('title','success');
                    // req.flash('message','Your Team have been registered successfully');
                    console.log('registered successfully')
                    return res.redirect('/auth/login')  //TODO
                }
            });
        }

    }catch(err){
        console.log(err);
        res.redirect('/auth/login')
    }
    

})

router.post('/login',async(req,res)=>{
    // console.log(req.body);
    const {email, password} = req.body;
    try{
            const foundUser = await User.findOne({email:email})
            if(!foundUser){
                //If team name already exist
                console.log("TeamName not found")
                // req.flash('title','danger');
                // req.flash('message',`TeamName ${teamName} does not exist`);
                return res.redirect('/auth/login');
            }
            else{
                if(bcrypt.compareSync(password, foundUser.password)){
                    console.log("loggedin")
                    // req.flash('title','success');
                    // req.flash('message',`Welcome to CyberQuest Team - ${teamName}`);
                    passport.authenticate("local")(req, res, function () {
                       console.log('authenticated');
                       console.log(req.isAuthenticated())
                        res.redirect("/");
                        
                    });
                
                }else{
                    console.log("Password Incorrect")
                    // req.flash('title','danger');
                    // req.flash('message','Password Incorrect! Try again');
                    return res.redirect('/auth/login');
                }
        }
            
        }catch(err){
            console.log("error",err);
            req.flash('title','danger');
            req.flash('message','Something went wrong! Please Try Again.');
            return res.redirect('/auth/login')
        }

    
});

module.exports = router;

