const express = require('express');
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    ownerName:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    posts:[{
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    },
    createdAt:{
        type:Date
    }
    }],
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]

});
const Group = mongoose.model('Group',groupSchema);

module.exports = Group; 