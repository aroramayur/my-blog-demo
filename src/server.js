import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
const path = require('path');
import {withDB} from './db';

const articlesInfo = {
    'learn-react':{
        'upvotes':0, 
        "comments":[]
    },
    'learn-node':{
        'upvotes':0,
        "comments":[]
    },
    'my-thoghts-on-resumes':{
        'upvotes':0,
        "comments":[]
    },
};

const app = express();

app.use(express.static(path.join(__dirname,'./build/')));

app.use(bodyParser.json());

app.get('/hello', (req,res ) => {
    res.send('Hello!');
});

app.get('/hello/:name', (req,res ) => {
    const {name} = req.params;
    res.send(`Hello ${name}`);
});


app.post('/hello', (req,res) => {
    const {name} = req.body;
    res.send(`Hello ${name}`);
});

app.get('/api/articles/:name',  async (req,res) => {
    await withDB(async db => {
        const {name: articleName} = req.params;
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        if(articleInfo) {
            res.status(200).json(articleInfo);
        }
        {
            res.status(404).send('Article not found');
        }      
    });
    
});

app.post('/api/articles/:name/upvote', async (req,res) => {
    await withDB(async db => {
        const {name: articleName} = req.params;
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        if(!articleInfo) return res.status(404).send('Article not found.');
        await db.collection('articles').updateOne({
            name:articleName
        }, {
            '$set':{
                upvotes:articleInfo.upvotes + 1
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    })
});

app.post('/api/articles/:name/comment', async (req,res) => {
    await withDB(async db => {
        const {name: articleName} = req.params;
        console.log(req.body.comment)
        const articleInfo = await db.collection('articles').findOne({name:articleName});
        if(!articleInfo) return res.status(404).send('Article not found.');
        await db.collection('articles').updateOne({
            name:articleName
        }, {
            '$set':{
                comments:articleInfo.comments.concat([req.body.comment])
            }
        })
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    })
});


app.get('*',function(req,res){
    res.sendFile(path.join(__dirname+'/build/index.html'));
  });


app.listen(8000, () => console.log('Server is listening on port 8000'));