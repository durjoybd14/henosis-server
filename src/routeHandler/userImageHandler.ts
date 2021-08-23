import express from 'express';
import mongoose from 'mongoose';
import userImagesSchema from '../schemas/userImageSchemas';

const router = express.Router();
const UserImages = mongoose.model('UserImages', userImagesSchema);

router.post('/', (req, res) => {
    UserImages.findOne({ email: req.body.email }).then((existEmail: string) => {
        if (existEmail) {
            console.log('User image already exist');
        } else {
            const userImg = new UserImages(req.body);
            userImg.save((err: mongoose.CallbackError) => {
                if (err) {
                    res.status(500).json({
                        error: 'There was a server side error!',
                    });
                } else {
                    res.status(200).json({
                        message: 'New User image was recorded successfully!',
                    });
                }
            });
        }
    });
});

router.get('/:email', async (req, res) => {
    try {
        const data = await UserImages.find({ email: req.params.email });
        res.status(200).json({
            data,
            message: 'User profile image info collected successfully!',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error!',
        });
    }
});

router.put('/:email', (req, res) => {
    const result = UserImages.findOneAndUpdate(
        { email: req.params.email },
        {
            $set: {
                imageURL: req.body.imageURL,
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
                    message: 'User profile image was updated successfully!',
                });
            }
        },
    );
    console.log(result);
});

export default router;
