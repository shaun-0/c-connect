const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function(passport){

    passport.use(
        new LocalStrategy({ usernameField:'email'},(email,password,done)=>{
            
                User.findOne({email:email})
                .then((foundUser)=>{
                    if(!foundUser){
                        // console.log("TeamName not found")
                        return done(null,false,{
                            title:"danger",
                            message:"User does not exist"
                        });
                       
                    }
                    else{
                        if(bcrypt.compareSync(password, foundUser.password)){
                            console.log('userfound and auth')
                            return done(null,foundUser,{
                                title:"success",
                                message:`Welcome`
                            });

                           
                        }else{
                            console.log("Password Incorrect")
                            return done(null,false,{
                                title:"danger",
                                message:"Incorrect Password"
                            });

                        }
                    
                    }
            })
            .catch((err)=>{

                console.log(err);
                return done(null,false,{message:"Something went wrong"})
            })
            

            }))
           
            
            passport.serializeUser((user,done)=>{
                done(null,user.id);
            })
            passport.deserializeUser((id,done)=>{
                User.findById(id,(err,user)=>{
                    done(err,user);
                })
            })

}
    

    
