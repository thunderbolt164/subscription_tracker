import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../config/env.js";
import User from '../models/user.model.js';

// steps that how middle ware are working 
// 1st-> someone is ,making a get request to get user details -> authorize middle ->verify ->if valid -> next -> get user details 

// Some error in this authorization we will check latter the error is in get request it is showing unauthorized. 
const authorize = async(req, res , next)=>{
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token)return res.status(401).json({message:'unauthorized'});
           
        const decoded = jwt.verify(token,JWT_SECRET);

       const user = await User.findById(decoded.userID); 

        if(!user)return  res.status(401).json({message:'unauthorized'});

        
        req.user = user;
        next();
    } catch (error){
       res.status(401).json({message:'Unauthorize',error:error.message});
    }
}
export default authorize;