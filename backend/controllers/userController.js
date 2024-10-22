import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';

// api to register user
const registerUser = async (req,res) => {

    try {

        const {name, email, password} = req.body

        if( !name || !password || !email) {
            return res.json({success:false,message:"Missing Details"})
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"Please enter a valid email, thank you!"})
        }

        // validating a strong password
        if (password.length < 8) {
            return res.json({success:false,message:"Please enter a strong password, thank you!"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET )

        res.json({success:true,token})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message})
    }

}

// API for user login
const loginUser = async (req,res) => {

    try {
        
        const {email, password} = req.body
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({success:false,message:'User does not exist'})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if (isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message})   
    }

}

// API to get user profile data

const getProfile = async (req,res) => {
    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({success:true,userData})
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message})   
        
    }
}

// API to update user profile 

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file; // Adjusted to use req.file if using multer

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        // Update user profile without image
        await userModel.findByIdAndUpdate(userId, { 
            name, phone, address: JSON.parse(address), dob, gender 
        });

        // Check if image file is provided
        if (imageFile) {
            try {
                // Upload image to Cloudinary
                console.log('Uploading image to Cloudinary:', imageFile.path);
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, { 
                    resource_type: 'image' 
                });
                const imageURL = imageUpload.secure_url;

                // Update user image in database
                await userModel.findByIdAndUpdate(userId, { image: imageURL });
                console.log('Image uploaded successfully:', imageURL);
            } catch (err) {
                console.error('Cloudinary upload failed:', err);
                return res.json({ success: false, message: 'Image upload failed' });
            }
        }

        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        console.error('Update profile failed:', error);
        res.json({ success: false, message: error.message });
    }
};

// API to book appointment
const bookAppointment = async (req,res) => {
    try {
        const {userId, docId, slotDate, slotTime} = req.body
        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({success:false,message:'Sorry, Doctor not available'})
        }

        let slots_booked = docData.slots_booked

        // checking for slot availability
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({success:false,message:'Sorry, Slot not available'})
            } else {
                slots_booked[slotDate].push (slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await user.Model.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment  = new appointmentModel (appointmentData)
        await newAppointment.save()

        // Save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        res.json({success:true,message:'Appointment Booked!'})
        
    } catch (error) {
        console.error('Update profile failed:', error);
        res.json({ success: false, message: error.message });
    }
}


export {registerUser,loginUser, getProfile, updateProfile, bookAppointment}