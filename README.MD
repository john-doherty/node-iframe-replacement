# node-iframe-replacement

Imagine the scenario: you've built a lovely web app for a business, who later insists it goes live within an iframe of their corp website. You resist, but you're ultimatley forced to bastardize your app to make it work. 

[node-iframe-replacement](https://github.com/john-doherty/node-iframe-replacement) is the compromise. A small node server that grabs the source code of an external website and injects your content - thus allowing you to host your app on a subdomain and without an iframe. Changes to the external site _(navigation etc)_ are automatically picked up every 5 minutes and reflected in your app.

You can now argue that you're web app can remain synced with the corp website without an iframe.


## Installation

```bash
$ npm install --save node-iframe-replacement
```

## Example usage

The example below will request the [BBC News](http://www.bbc.co.uk/news) home page and replace the contents of **div[data-entityid="container-top-stories#1"]** with the contents of the view

```js
var iframeReplacement = require('node-iframe-replacement');

// replace res.render with iframe replacement version
app.use(iframeReplacement);

// create a regular express route
app.get('/', function(req, res){

    // respond to this request with our fake-new content embedded within the BBC News home page
    res.merge('fake-news', {
       sourceUrl: 'http://www.bbc.co.uk/news',                              // external url to fetch
       sourcePlaceholder: 'div[data-entityid="container-top-stories#1"]'    // css selector to inject our content into
    });
});
```

## fake-news html

```html
<div style="margin: 0 0 0 20px; overflow: auto;">
    <div style="width: 210px; float: left;">
        <a href="https://github.com/john-doherty/node-iframe-replacement" target="_blank">
            <h3 style="color: #222; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">iframe replacement Node.js module lanuched</h3>
        </a>
        <p style="padding: 0; font-size: 14px;line-height: 22px">
            Open source project not only has the potential to replace iframes, but also brings a whole new meaning to the concept of fake news.
        </p>
    </div>
    <img src="https://cdn.colorlib.com/wp/wp-content/uploads/sites/2/nodejs-frameworks.png" alt="Node js logo" style="width: 500px; float: right;"/>
</div>
```

## Input

![alt text](docs/bbc-news-actual-homepage.png "BBC News actual homepage")

## Output

![alt text](docs/bbc-news-fake-homepage.png "BBC News actual homepage")

## Auto base tag injection

To ensure the source scripts, styles and images load witin your site a base tag is automatically injected ```<base href="http://www.bbc.co.uk/news" />```.

Because of this, you need to ensure all the links within your conent are absolute.

## Note on Patches/Pull Requests

* Fork the project
* Make your feature addition or bug fix
* Send me a pull request

## License

[ISC License](LICENSE) &copy; 2016 [John Doherty](https://twitter.com/CambridgeMVP)