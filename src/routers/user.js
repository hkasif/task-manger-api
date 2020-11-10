const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail,sendCancelationEmail} = require('../emails/accounts')


const router = new express.Router()

router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        //sendWelcomeEmail(user.email,user.name)
        const token = await user.genrateAuthToken()

        res.status(201).send({user,token})
    }catch (e){
        res.status(400).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.genrateAuthToken()
        if(user){
            res.status(200).send({user,token})
        }
    } catch (e) {
        res.status(400).send()
    }

})
router.post('/users/logout',auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me',auth, async (req,res)=>{
    res.send(req.user)
})


router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowUpdates = ['name','age','email','password']
    const isValidUpdate = updates.every((update)=> allowUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error: 'Not a valid update!'})
    }
    try{
        updates.forEach((update)=>  req.user[update] = req.body[update] )
        await req.user.save()
    
        res.send(req.user)
    }catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try {
        await req.user.remove();
        //sendCancelationEmail(user.email,user.name)
        res.send(req.user)
    }catch(e) {
        res.status(500).send()
    }
})

const uploads = multer({
    limits: {
        // max file size is of 3 MB 
        fileSize: 3000000
    },
    fileFilter(req,file,cb){
        // to be sure file must be an image 
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return  cb(new Error('File must be a image'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,uploads.single('avatar'),async (req,res)=>{
    // always store file in .png formate and size (250x250)
    const buffer = await sharp(req.file.buffer).resize({width: 250,height: 250}).png().toBuffer()
    req.user.avatar = buffer // save avatar in database 
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error()
        }
        // send jpg image instead of json data 
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router
