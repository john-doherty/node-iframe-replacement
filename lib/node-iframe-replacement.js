'use strict';

var cheerio = require('cheerio'),           // used to convert raw html into jQuery style object to we can use css selectors
    request = require('request-promise'),   // promise based request object
    NodeCache = require( "node-cache" ),    // auto expiring in memory caching collection
    cache = new NodeCache({ stdTTL: 300 }); // cache source HTML for 5 minutes, after which we fetch a new version

// override res.render to allow us to fetch template url or use html template string
module.exports = function(req, res, next){
    
    // replace the standard res.render function so we can intercept response rendering
    res.merge = function(view, model, callback){
        
        if (!model.sourceUrl){
            // no .sourceUrl, therefore process this as normal
            res.render(view, model, callback);
        } 
        else {

            // if no template selector provided, use body tag
            var sourcePlaceholder = model.sourcePlaceholder || 'body';
            
            // resolve the template, either url to jquery object or html
            resolveTemplate(model.sourceUrl).then(function($template){
                
                // if a transform method is provided, execute
                if (model.transform){
                    // pass a jquery version of the html along with a copy of the model
                    model.transform($template, model);
                }
                
                // convert view into html to be inserted
                res.render(view, model, function(err, html) {
                    if (err) next(err);
                    
                    // convert view into jquery object
                    var $view = cheerio.load(html);
                    
                    // if the view contains a head, append its contents to the original
                    var $viewHead = $view('head');
                    if ($viewHead && $viewHead.length>0){
                        // append meta, link, script and noscript to head
                        $template('head').append($viewHead.html());
                    }
                    
                    // if the view has a body, use its contents otherwise use the entire content 
                    var $viewBody = $view('body');
                    if ($viewBody && $viewBody.length>0){
                        // inject content into selector or body
                        $template(sourcePlaceholder).html($viewBody.html());    
                    }
                    else {
                        // no body tag in view, insert all content
                        $template(sourcePlaceholder).html($view.html());   
                    }
                    
                    // return merged content
                    res.status(200).send($template.html());
                });
            })
            .catch(function(err){
                // request failed, inform the user
                res.status(500).send(err).end(); 
            });
        }
    };
    
    next();
}

/**
 * Converts template url to $ object 
 * @param {string} template - url to external template or html content
 */
function resolveTemplate(template){
    
    return new Promise(function(resolve, reject){
        
        // if its a url and we have the contents in cache
        if (template.isUrl() && cache.get(template)){
            
            // get template html from cache
            var html = cache.get(template);
            
            // covert html into jquery object
            var $ = cheerio.load(html);
            
            // return template as a jquery style object
            resolve($);
        }
        else if (template.isUrl()){
            
            // request the template url
            return request({ uri: template }).then(function(html){
                
                // convert html into jquery style object so we can use selectors
                var $ = cheerio.load(html);
                
                // add base url to ensure links/scripts/styles load correctly
                $('head').prepend('<base href="' + template + '">');
                
                // cache result as HTML so we dont have to keep getting it for future requests and it remains clean
                cache.set(template, $.html());
                
                // resolve with jquery object containing content
                resolve($);
            })
            .catch(function(err) {
                
                // request failed
                reject('Unable to retrieve ' + template);
            });
        }
        else {
            // the template must contain markup, just return it
            resolve(template);
        }
    });
}

// helper function to allow us to determine if the template is a url
String.prototype.isUrl = function(){ 
    return /^http[s]?:\/\/([\w-]+\.)+[\w-]+([\w-./?%&=]*)?$/i.test(this);
}