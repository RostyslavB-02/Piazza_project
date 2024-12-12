const express = require('express')
const router = express.Router()

const Post = require('../models/Post')
const verifyToken = require('../verifyToken')

// Middleware to check post expiration
const checkPostExpiration = async (post) => {
    if (post.expirationTime < new Date() && post.status === 'Live') {
        post.status = 'Expired';
        await post.save();
    }
};

// See all posts
router.get('/', verifyToken, async(req,res) =>{
    try{
        const posts = await Post.find()
        res.send(posts)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/:topic', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({ topic: req.params.topic });
        await Promise.all(posts.map(checkPostExpiration));
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new post
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title, topic, body, expirationTime } = req.body;
        const post = new Post({
            title,
            topic,
            body,
            authorId: req.user._id,
            expirationTime
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like a Post
router.post('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await checkPostExpiration(post);
        if (post.status === 'Expired') {
            return res.status(400).json({ error: 'Cannot like an expired post' });
        }
        if (post.authorId.toString() === req.user._id) {
            return res.status(400).json({ error: 'Users cannot like their own posts' });
        }
        if (!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            post.dislikes = post.dislikes.filter((id) => id.toString() !== req.user._id);
            await post.save();
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Dislike a Post
router.post('/:id/dislike', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await checkPostExpiration(post);
        if (post.status === 'Expired') {
            return res.status(400).json({ error: 'Cannot dislike an expired post' });
        }
        if (!post.dislikes.includes(req.user._id)) {
            post.dislikes.push(req.user._id);
            post.likes = post.likes.filter((id) => id.toString() !== req.user._id);
            await post.save();
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add a Comment to a Post
router.post('/:id/comment', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        await checkPostExpiration(post);
        if (post.status === 'Expired') {
            return res.status(400).json({ error: 'Cannot comment on an expired post' });
        }
        const comment = {
            userId: req.user._id,
            comment: req.body.comment,
        };
        post.comments.push(comment);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router