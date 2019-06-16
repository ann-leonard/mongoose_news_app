module.exports = function(app, Article){
    app.get("/", function(req,res){
        res.render("index")
    })

    app.get("/load", function(req,res){
        res.render("loading")
    })

    app.get("/articles", function(req,res){
        Article.find({}).then(function(articles){
            res.render("results", {articles})
        })
    })
}