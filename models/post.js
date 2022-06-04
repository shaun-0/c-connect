const express = require('express');
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    ownerName:{
        type:String,
        required:true
    },
    ownerPic:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    postedIn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group"
    },
    createdAt:{
        type : Date, 
        default: Date.now 
    },
    likes:{
        type:Number,
        default:0
    },
    likedBy:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]

});
const Post = mongoose.model('Post',postSchema);

module.exports = Post; 