const express = require('express');
const mongoose = require('mongoose');
let image = Math.floor(Math.random()*10 + 1)+".png"
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    pic:{
        type:String,
        default:image
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    joinedGroups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group"
    }],
    ownedGroups:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Group"
        }
    ],
    posts:[
        {
            post:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Post"
            },
            createdAt:{
                type:Date
            }
        }
    ]
});
const User = mongoose.model('User',userSchema);

module.exports = User; 