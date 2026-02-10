import Express from"express";

const app = Express()

const PORT = process.env.PORT || 8000;

app.get('/',(req,res)=>{
    res.send(`<h1>This is the Read Repair Mechanish</h1>`)
})

app.listen(PORT,()=>{
    console.log(`server is live on port${PORT}`);
    
})