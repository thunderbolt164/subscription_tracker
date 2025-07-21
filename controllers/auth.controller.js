
import mongoose from 'mongoose'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import {JWT_SECRET,JWT_EXPIRES_IN}from '../config/env.js';

// What is the request(req) body ? -> req.body is   an object   containing data from the client (Post request )



export const signUp = async(req,res,next)=>{
const session = await  mongoose.startSession();
session.startTransaction();

try{
    const {name, email, password} = req.body;

    //check if a user  already exists
    const existingUser = await User.findOne({email});
    if(existingUser) {
        const error  = new Error('user already exists');
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const salt  = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUsers = await User.create([{name,email,password:hashedPassword}],{session});

    const token = jwt.sign({userId: newUsers[0]._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        success:true,
        message:'User created successfully',
        date:{
            token,
            user:newUsers[0],
        }
    })
}catch(error){
    await session.abortTransaction();
    session.endSession();
    next(error);
}
}

export const signIn = async(req,res,next)=>{

try{
    const{email, password} = req.body; 
    const user  = await User.findOne({email});
    if(!user){
        const error =  new Error('User not found ');
        error.statusCode = 404;
        throw error;
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        const error  = new Error('Invalid Password');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign({userID:user._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});

    res.status(200).json({
        success:true,
        message:'User signed in successfully',
        data:{
            token,
            user,
        }
    });

}catch(error){
        next(error); 
    }
}

export const signOut = async(req,res,next)=>{}
