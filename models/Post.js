const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        minlength: 3, 
        maxlength: 256 
    },
    topic: { 
        type: String, 
        enum: ['Politics', 'Health', 'Sport', 'Tech'], 
        required: true 
    },
    body: { 
        type: String, 
        required: true, 
        minlength: 1 
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: 
        Date.now 
    },
    expirationTime: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Live', 'Expired'], 
        default: 'Live' 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }],
    dislikes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }],
    comments: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, 
    }]
  });
  
module.exports = mongoose.model('posts', PostSchema);