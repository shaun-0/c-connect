const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose')
const Group = require('./../models/group')
const User = require('./../models/user.js')
const Post = require('./../models/post')

const checkAuthenticated = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    // req.flash('title','danger');
    // req.flash('message','Please Login first');
    console.log(req.isAuthenticated())
    res.redirect('/auth/login');
}

router.get('/',checkAuthenticated,async (req,res)=>{
    const currUser = await User.findById(req.user._id).populate({path:'joinedGroups',select:['name','posts']});
    // console.log(currUser);
    let userFeed =[];
    currUser.joinedGroups.forEach(async(group)=>{
        // console.log(group);
        group.posts.sort((a, b) => {
            let da = new Date(a.createdAt),
                db = new Date(b.createdAt);
            return db - da ;
        });
        let recentPostsInCurrGroup = group.posts.slice(0,20)
        recentPostsInCurrGroup.forEach((eachpost)=>{
            let postObj = {
                postObj:eachpost,
                groupName:group.name
            }
            userFeed.push(postObj)
        })
    })

    userFeed.sort((a, b) => {
        let da = new Date(a.postObj.createdAt),
            db = new Date(b.postObj.createdAt);
        return db - da ;
    });

    userFeed = userFeed.slice(0,50);
    let allPostsFeed = [];
    for(const eachpost of userFeed){
        let currPost = await Post.findById(eachpost.postObj.post.toString());
        let finalPost = {
            post:currPost,
            groupName:eachpost.groupName
        }
        allPostsFeed.push(finalPost);
    }

    // console.log(allPostsFeed);
    res.render('homepage',{posts:allPostsFeed,user:req.user})
    
})
router.get('/myGroups',checkAuthenticated,async(req,res)=>{
    let groups = await User.findById(req.user._id.toString(),{
        _id:0,
        name:0,
        pic:0,
        username:0,
        email:0,
        password:0,
        posts:0
    }).populate({path:'joinedGroups',select:['name','_id']})
    .populate({path:'ownedGroups',select:['name','_id']});
    // console.log(groups)
    res.render('mygroups',{groups:groups,user:req.user})
})
router.get('/editGroup/:id',checkAuthenticated,async (req,res)=>{
    let found = false;
    for(const grp of  req.user.ownedGroups){
        if(grp._id == req.params.id){
            found = true;
            // console.log('yess');
            break;
        }
    }
    if(found){
        let foundgroup = await Group.findById(req.params.id,{
            ownerName:0,
            owner:0,
            posts:0
        }).populate({path:'members',select:['username','pic']});
        if(foundgroup){
            // console.log(foundgroup)
            res.render('editgroup',{group:foundgroup,user:req.user})
        }else{
            console.log('not found grp');
        res.redirect('/')
        }
    }else{
        console.log('not found grp');
        res.redirect('/')
    }
})


router.post('/editGroup/:id',checkAuthenticated,async(req,res)=>{
    try{
        // console.log(req.body)
        let ownerId = req.user._id.toString();
        let memberList = req.body.members;
        let memList = memberList.split('\r\n');
        let allMembers = [];
        for(const curruser of memList){
            let foundUser = await User.findOne({username:curruser});
            if(foundUser){
                let flag=false;
                for(const grp of foundUser.joinedGroups){
                    if(grp.toString() == req.params.id){
                        flag=true;
                        break;
                    }
                }
                if(flag==false)allMembers.push(foundUser._id.toString())
            }
        }
         allMembers = [ ...new Set(allMembers) ]
            let updatedgrp = await Group.findByIdAndUpdate(req.params.id,{
                $set:{
                    'name':req.body.name
                },
                $push:{
                    'members':allMembers
                }
            },{
                'new':true
            })
            
              if(updatedgrp){
                // console.log("updatedgrp created ",updatedgrp);
              
              }else{
                  console.log('NOt created')
                   return res.redirect('/')
              }
              for(const memberId of allMembers){
                  console.log('aa');
                let newMember = await User.findById(memberId);
                if(newMember){
                            let newUpdated = await User.updateOne({_id:memberId},{
                                $push:{
                                    joinedGroups:req.params.id
                                }
                            })
                }
              };
              res.redirect("/")

        
      }catch(err){
        req.flash("error",err.message);
        console.log(err)
        res.redirect("/")
      }
})


router.get('/newGroup',checkAuthenticated,async(req,res)=>{
    res.render('newgroup')
})


router.post('/newGroup',checkAuthenticated,async(req,res)=>{
    try{
        let ownerId = req.user._id.toString();
        let memberList = req.body.members;
        let memList = memberList.split('\r\n');
        let allMembers = [req.user._id.toString()];
        for(const curruser of memList){
            let foundUser = await User.findOne({username:curruser});
            if(foundUser){
                allMembers.push(foundUser._id.toString())
            }
        }
         allMembers = [ ...new Set(allMembers) ]
            let newGroup = await Group.create({
                name: req.body.name,
                ownerName: req.user.name,
                owner: ownerId,
                members: allMembers
              })
              if(newGroup){
                console.log("newGroup created ",newGroup);
              //   req.flash("success","Product created");
              res.redirect("/")
              }else{
                  console.log('NOt created')
                  res.redirect('/')
              }
              let updateUser = await User.updateOne({_id:ownerId},{
                  $push:{
                      ownedGroups:newGroup._id.toString()
                  }
              })
              allMembers.forEach(async(memberId)=> {
                  console.log('aa');
                let newMember = await User.findById(memberId);
                if(newMember){
                    let newUpdated = await User.updateOne({_id:memberId},{
                        $push:{
                            joinedGroups:newGroup._id.toString()
                        }
                    })
                }
              });

        
      }catch(err){
        req.flash("error",err.message);
        console.log(err)
        res.redirect("/")
      }
})
router.get('/newPost',checkAuthenticated,async(req,res)=>{

    let userGroup = await User.findById(req.user._id.toString(),{
            joinedGroup:1
    }).populate({path:'joinedGroups',select:['name','_id']})
    // console.log(userGroup)
    res.render('newpost',{group:userGroup,user:req.user})
})
router.post('/newPost',async(req,res)=>{
    try{
        let foundGroup = await Group.findById(req.body.postedIn);
        if(!foundGroup){
            console.log('Not found group')
            res.redirect('/')
        }else{
            let creator = req.user;
            if(creator){
                let newPost = await Post.create({
                    text: req.body.text,
                    ownerPic: creator.pic,
                    ownerName: creator.name,
                    owner: creator._id.toString(),
                    postedIn: req.body.postedIn
                  })
                  if(newPost){
                      let postwithtime = {
                          post:newPost._id.toString(),
                          createdAt:Date.now()
                      }
                      let updatedGroup = await Group.updateOne({_id:req.body.postedIn},{
                          $push:{
                              posts:postwithtime
                          }
                      })
                      let UpdatedUser = await User.updateOne({_id:req.body.owner},{
                          $push:{
                              posts:postwithtime
                          }
                      })
                    //   console.log(newPost._id.toString())
                  //   req.flash("success","Product created");
                  res.redirect("/")
                  }else{
                      console.log('NOt created')
                      res.redirect('/')
                  }
            }else{
                console.log('user not found')
                res.redirect('/')
            }
            
        }
       
      }catch(err){
        req.flash("error",err.message);
        console.log(err)
        res.redirect("/")
      }
})
module.exports = router;