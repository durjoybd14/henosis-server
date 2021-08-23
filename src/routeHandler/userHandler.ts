import express from 'express';
import mongoose from 'mongoose';
import userSchema from '../schemas/userSchemas';

const router = express.Router();
const User = mongoose.model('User', userSchema);

router.post('/', (req, res) => {
    User.findOne({ email: req.body.email }).then((existEmail: string) => {
        if (existEmail) {
            console.log('User data already exist');
        } else {
            const user = new User(req.body);
            user.save((err: mongoose.CallbackError) => {
                if (err) {
                    res.status(500).json({
                        error: 'There was a server side error!',
                    });
                } else {
                    res.status(200).json({
                        message: 'New User info was recorded successfully!',
                    });
                }
            });
        }
    });
});

router.get('/', (req, res) => {
    User.find({}, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'All User info collected successfully!',
            });
        }
    });
});

router.get('/:email', async (req, res) => {
    try {
        const data = await User.find({ email: req.params.email });
        res.status(200).json({
            data,
            message: 'User Profile info collected successfully!',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error!',
        });
    }
});

router.put('/:email', (req, res) => {
    const result = User.findOneAndUpdate(
        { email: req.params.email },
        {
            $set: {
                name: req.body.name,
                email: req.params.email,
                imageURL: req.body.imageURL || 'https://i.ibb.co/Cv782Sw/user.png',
                githubLink: req.body.githubLink || 'https://github.com/username',
                location: req.body.location || 'street no. cityname, countryname',
                bio: req.body.bio || 'your favorite things',
            },
        },
        {
            new: true,
            useFindAndModify: false,
        },
        (err) => {
            if (err) {
                res.status(500).json({
                    error: 'There was a server side error!',
                });
            } else {
                res.status(200).json({
                    message: 'User profile was updated successfully!',
                });
            }
        },
    );
    console.log(result);
});

export default router;
