module.exports = function (app, axios, cheerio, db) {

    app.get('/scrape', function (req, res) {
        console.log("your get dun got it")
        // Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.
        axios.get("https://buzzfeednews.com").then(function (response) {

            // Load the Response into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(response.data);

            // An empty array to save the data that we'll scrape
            var results = [];
            // With cheerio, find each p-tag with the "title" class
            // (i: iterator. element: the current element)
            $(".newsblock-story-card__info").each(function (i, element) {
                let result = {}
                // Save the text of the element in a "title" variable
                result.title = $(element).find(".newsblock-story-card__title").text().trim();
                result.description = $(element).find(".newsblock-story-card__description").text().trim()
                result.link = $(element).parent(".newsblock-story-card__link").attr("href")
                // In the currently selected element, look at its child elements (i.e., its a-tags),
                // then save the values for any "href" attributes that the child elements may have
                // var link = $(element).children().attr("href");

                // Save these results in an object that we'll push into the results array we defined earlier
                

                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            })

            // Log the results once you've looped through each of the elements found with cheerio
            console.log(results);

        })
    })
}
