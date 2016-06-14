/**
 * @overview comment functionality for <i>ccm</i> component
 * @author Patrick Reif <patrick.reif@inf.h-brs.de>
 * @copyright Copyright (c) 2015-2016 Bonn-Rhein-Sieg University of Applied Sciences
 * @license The MIT License (MIT)
 */

ccm.component( {

  /*-------------------------------------------- public component members --------------------------------------------*/

  /**
   * @summary component name
   * @memberOf ccm.components.blank
   * @type {ccm.name}
   */
  name: 'comment',

  /**
   * @summary default instance configuration
   * @memberOf ccm.components.blank
   * @type {ccm.components.blank.config}
   */
  config: {
	key		: 'comment'		,
    html	: [ ccm.load	, './json/comment_html.json' ],
    mock	: [ ccm.load	, './json/comment.json' ],
    i18n	: [ ccm.load	, './json/comment_i18n.json' ],
    store	: [ ccm.store	, { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'comment' }],
    user	: [ ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js' ],
    style	: [ ccm.load	, './css/comment.css' ]
  },

  /*-------------------------------------------- public component classes --------------------------------------------*/

  /**
   * @summary constructor for creating <i>ccm</i> instances out of this component
   * @alias ccm.components.blank.Blank
   * @class
   */
  Instance: function () {
	  
	  
	  // --------------------------------------------------------------
	  // model context
	  
	  function Context(model, path, context) {
		  
		  // make sure path is of type string
		  if( typeof path !== "string" ) {
			  path = path + "";
		  }
		  
		  // check if context was provided
		  if( context ) {
			  // remove first slash if context exists
			  path = this._removeLeadingSlash(path);
			  // attach path if provided. Otherwise just use the context path
			  if( path.length > 0 ) {
				  path = context.getPath() + "/" + path;
			  } else {
				  path = context.getPath();
			  }
		  }
		  
		  this.model	= model;
		  this.path		= path;
	  };
	  
	  Context.prototype.getModel = function() {
		  return this.model;
	  };
	  
	  Context.prototype.getPath = function() {
		  return this.path;
	  };
	  
	  // gibt das gesamte datenset vom angegebenen pfad zurück
	  Context.prototype.getData = function() {
		  return this._traverse(this.getPath());
	  };
	  
	  Context.prototype.getProperty = function(property) {
		  return this._traverse(this.getPath() + "/" + property);
	  };
	  
	  Context.prototype._traverse = function(path) {
		  
		  // first make sure to remove the leading slash
		  // because function returns it as first element in array
		  var path 	= this._removeLeadingSlash(path);
		  // now split at "/"
		  var paths = path.split("/");
		  var data	= this.getModel();
		  
		  // cycle through the model to get desired data
		  for( var i=0; i<paths.length; i++ ) {
			  // make sure the path is reachable
			  if( data.hasOwnProperty(paths[i]) && data[paths[i]] ) {
				  data = data[paths[i]];
			  } else {
				  // otherwise reset data
				  data = null;
				  break;
			  }
		  }
		  
		  return data;
	  };
	  
	  Context.prototype._removeLeadingSlash = function(path) {
		  if ( path.indexOf("/") === 0 ) {
			  path = path.substring(1, path.length);
		  }
		  return path;
	  };

    /*------------------------------------- private and public instance members --------------------------------------*/

    /**
     * @summary own context
     * @private
     */
    var self = this;

    // ...

    /*------------------------------------------- public instance methods --------------------------------------------*/

    /**
     * @summary initialize <i>ccm</i> instance
     * @description
     * Called one-time when this <i>ccm</i> instance is created, all dependencies are solved and before dependent <i>ccm</i> components, instances and datastores are initialized.
     * This method will be removed by <i>ccm</i> after the one-time call.
     * @param {function} callback - callback when this instance is initialized
     */
    self.init = function ( callback ) {
    	
    	// set localization to the browser language
    	var userlang 	= (navigator.language || navigator.userLanguage) == "de" ? "de" : "en";
    	//self.i18n 		= self.i18n[userlang];
    	
    	self.i18n = self.i18n.en;
    	
    	// init datastore
    	
	    self.store.del( self.key, function() {
    	
	    	self.store.get( self.key, function(dataset) {
	    		
	    		if( dataset === null ) {
	    			var mockdata = { key : self.key, data : self.mock };
	    			self.store.set(mockdata, proceed);
	    		} else {
	    			proceed(dataset);
	    		}
	    	});
	    
	    });
	    
	    // when done call callback
	    function proceed( dataset ) {
	    	callback();
	    }
    };

    /**
     * @summary when <i>ccm</i> instance is ready
     * @description
     * Called one-time when this <i>ccm</i> instance and dependent <i>ccm</i> components, instances and datastores are initialized and ready.
     * This method will be removed by <i>ccm</i> after the one-time call.
     * @param {function} callback - callback when this instance is ready
     */
    self.ready = function ( callback ) {
    	
    	// ...
    	
    	callback();
    };

    /**
     * @summary render content in own website area
     * @param {function} [callback] - callback when content is rendered
     */
    self.render = function ( callback ) {
    	
	      ccm.helper.dataset(self, function( dataset ) {
	    	  
	    	  // Data from self.store to display
	    	  var model 			= dataset;
	    	  // Dynamic components we use for insertion
	    	  var components		= self.html.component;
	    	  // i18n model
	    	  var i18n				= self.i18n;
	    	  
	    	  // ---------------------------------------------------
	    	  
	    	  // setup layout
	    	  var body 		= ccm.helper.element(self);
	    	  var section 	= set(body, self.html.main, {
	    		  number 				: model.data.count,
	    		  HEADER_NUM_COMMENTS	: i18n.HEADER_NUM_COMMENTS
	    	  });
	    	  
	    	  var header			= first(section, "h1");
	    	  
	    	  // add postbox directly after the header
	    	  // the context determines where the answers will be placed afterwards
	    	  var comments_context	= new Context(model, "/data/comments");
	    	  var postbox			= insertPostboxAfter(header, comments_context);
	    	  
	    	  // now render comments
	    	  var comments_div 		= first(section, ".comments");
	    	  var comments			= comments_context.getData();
	    		  
	    	  for( var i=0; i < comments.length; i++ ) {
	    		  
	    		  // FIXME this is a mess but should work. Needs cleanup
	    		  
	    		  // we need two context information for the comment
	    		  // 1.) a context which points to the comment
	    		  // 2.) a context which points to a location where the postbox will place its comment
	    		  
	    		  var comment_context	= new Context(model, i			, comments_context);
	    		  var replies_context	= new Context(model, "replies"	, comment_context);
	    		  
	    		  var comment_div		= appendComment(comments_div, comment_context, replies_context);
	    		  var replies			= replies_context.getData("replies");
	    		  
	    		  // check if there are replies. If yes attach them, too
	    		  if( replies && replies.length > 0 ) {
	    			  
	    			  // get followup data
	    			  var followup_div 		= first(comment_div, ".followup");
	    			  
	    			  // append replies
	    			  for( var j=0; j < replies.length; j++ ) {
	    				  var reply_context = new Context(model, j, replies_context);
	    	    		  appendComment(followup_div, reply_context, replies_context);
	    			  }
	    		  }
	    	  }
	    	  
	    	  // perform callback
	    	  if ( callback ) callback();
	    	  
	    	  // ---------------------------------------------------------------------------
	    	  // PRIVATE
	    	  
	    	  function insertPostboxAfter(element, context) {
	    		  
	    		  var postbox_div = insertAfter(element, getTemplate("postbox"), {
	    			  // i18n
	    			  POSTBOX_INSERTCOMMENT			: i18n.POSTBOX_INSERTCOMMENT,
	    			  POSTBOX_SEND					: i18n.POSTBOX_SEND,
	    			  POSTBOX_USER_GUEST			: i18n.POSTBOX_USER_GUEST,
	    			  // events
	    			  onPostboxTextareaClick 		: onPostboxTextareaStateChange,
	    			  onPostboxButtonSubmitClick	: function(event) {
	    				  onPostboxButtonSubmitClick(event, postbox_div, context);
	    			  }
	    		  });
	    		  
	    		  // textarea
	    		  var textarea = first(postbox_div, ".textarea");
	    		  $(textarea).on("focusout"	, onPostboxTextareaStateChange);
	    		  
	    		  return postbox_div;
	    	  };
	    	  
	    	  function appendComment(element, context, postbox_context) {
	    		  
	    		  var comment			= context.getData();
	    		  var date				= convertISODateToDate(comment.date);
	    		  var comment_div 		= append(element, getTemplate("comment"), {
	    			  // localization
	    			  COMMENT_BUTTON_REPLY		: i18n.COMMENT_BUTTON_REPLY,
	    			  COMMENT_BUTTON_CLOSE		: i18n.COMMENT_BUTTON_CLOSE,
	    			  // data
	    			  name 						: comment.guest ? i18n.POSTBOX_USER_GUEST : comment.name,
	    			  date 						: convertDateForOutput(date),
	    			  text 						: comment.text,
	    			  // events
	    			  onCommentButtonReplyClick	: function(event) {
	    				  onCommentButtonReplyClick(event, comment_div, postbox_context);
	    			  },
	    			  onCommentButtonCloseClick : function(event) {
	    				  onCommentButtonCloseClick(event, comment_div, postbox_context);
	    			  }
	    		  });
	    		  
	    		  return comment_div;
	    	  };
	    	  
	    	  // calculcates the time difference between the given and current date
	    	  // outputs a string with an appropriate number between
	    	  //
	    	  // Used tutorial : http://stackoverflow.com/questions/17732897/difference-between-two-dates-in-years-months-days-in-javascript
	    	  // from Rajeev P Nadig
	    	  function convertDateForOutput(date) {
	    		  
	    		  var curr		= new Date();
	    		  var diff		= new Date(curr - date);
	    		  
	    		  var minutes	= diff.getMinutes();
	    		  var hours		= diff.getHours() - 1;
	    		  var days		= diff.getDate() - 1;
	    		  var months	= diff.getMonth() - 1;
	    		  var years		= diff.toISOString().slice(0, 4) - 1970;
	    		  
	    		  var i18n		= self.i18n;
	    		  var text		= i18n.COMMENT_DATE_PREFIX + " ";
	    		  
	    		  if( years > 0 ) {
	    			  text += years + " " + ( years > 1 ? i18n.COMMENT_DATE_YEARS : i18n.COMMENT_DATE_YEAR );
	    		  }
	    		  else if ( months > 0 ) {
	    			  text += months + " " + ( months > 1 ? i18n.COMMENT_DATE_MONTHS : i18n.COMMENT_DATE_MONTH); 
	    		  }
	    		  else if ( days > 0 ) {
	    			  text += days + " " + ( days > 1 ? i18n.COMMENT_DATE_DAYS : i18n.COMMENT_DATE_DAY); 
	    		  }
	    		  else if ( hours > 0 ) {
	    			  text += hours + " " + ( hours > 1 ? i18n.COMMENT_DATE_HOURS : i18n.COMMENT_DATE_HOUR);
	    		  }
	    		  else if ( minutes > 2 ) {
	    			  text += minutes + " " + i18n.COMMENT_DATE_HOURS;
	    		  }
	    		  else {
	    			  return i18n.COMMENT_DATE_NOW;
	    		  }
	    		  
	    		  text += " " + i18n.COMMENT_DATE_SUFFIX;
	    		  
	    		  return text;
	    	  };
	    	  
	    	  // get html template from json data
	    	  function getTemplate(name) {
	    		  return self.html.component[name];
	    	  };
	    	  
	    	  // --------------------------------------------------------------------
	    	  // BUSINESS LOGIC
	    	  
	    	  function onPostboxTextareaStateChange(event) {
	    		  
	    		  var type = event.type;
	    		  
	    		  $(this).toggleClass("inputerror"	, false);
	    		  
	    		  // get text and make sure it's not compromised
	    		  $(this).text(function(index, text) {
	    			  var text_cleaned 	= ccm.helper.val(text) || "";
	    			  
    				  switch(type) {
	    				  case "click":
	    					  if( text_cleaned === self.i18n.POSTBOX_INSERTCOMMENT ) {
	    	    				  $(this).toggleClass("placeholder"	, false);
	    	    				  return "";
	    	    			  }
	    					  break;
	    				  case "focusout":
	    					  if( text_cleaned.length === 0 ) {
	    	    				  $(this).toggleClass("placeholder"	, true);
	    	    				  return self.i18n.POSTBOX_INSERTCOMMENT;
	    	    			  }
	    					  break;
	    			  }
	    		  });
	    	  };
	    	  
	    	  // ------------------------------------------------------------
	    	  // --- POSTBOX REPLY
	    	  
	    	  // could be put into event but i'm too lazy atm
	    	  var temp_postbox = null;
	    	  
	    	  function onCommentButtonReplyClick(event, element, context) {
	    		  
	    		  // close old postbox if one is remaining
	    		  closePostbox();
	    		  
	    		  // now create a new one
	    		  var footer = first(element, ".footer");
	    		  $(footer).toggleClass("isreplying", true);
	    		  
	    		  var postbox 	= insertPostboxAfter(footer, context);
	    		  temp_postbox 	= {
	    			  footer 	: footer,
	    			  postbox	: postbox
	    		  }
	    	  };
	    	  
	    	  function onCommentButtonCloseClick(event, element, context) {
	    		  closePostbox();
	    	  };
	    	  
	    	  function closePostbox() {
	    		  
	    		  // we can only close temporary postboxes
	    		  if( temp_postbox ) {
	    			  
	    			  var footer 	= temp_postbox.footer;
	    			  var postbox 	= temp_postbox.postbox;
	    			  
		    		  $(footer).toggleClass("isreplying", false);
		    		  postbox.remove();
	    			  
	    			  temp_postbox = null;
	    		  }
	    	  };
	    	  
	    	  // ------------------------------------------------------------
	    	  
	    	  function onPostboxButtonSubmitClick(event, element, context) {
	    		  
	    		  var textarea 	= first(element, ".textarea");
	    		  var checkbox	= first(element, ":checkbox");
	    		  
	    		  textarea.text(function(index, text) {
	    			  var text_cleaned 	= ccm.helper.val(text);
	    			  var guest			= (checkbox.prop("checked") == true);
	    			  
	    			  if( typeof text_cleaned === "string" && text_cleaned.length > 2 ) {
	    				  if( text_cleaned !== self.i18n.POSTBOX_INSERTCOMMENT ) {
	    					  post(context, text_cleaned, guest);
	    					  $(this).toggleClass("inputerror", false);
	    				  } else {
	    					  $(this).toggleClass("inputerror", true);
	    				  }
	    			  } else {
	    				  $(this).toggleClass("inputerror", true);
	    			  }
	    		  });
	    	  };
	    	  
	    	  function post(context, text, guest) {
	    		  
	    		  // post if guest or at least logged in
	    		  if( guest || isLoggedIn() ) {
	    			  
	    			  self.store.get(self.key, function(dataset) {
	    				  
	    				  // we need to update the data to ensure that no comment is overridden
	    				  // for this we load the data and give it the same context as the input
	    				  
	    				  var model_new		= dataset;
	    				  var context_new  	= new Context(dataset, "", context);
	    				  var data 			= context_new.getData();
	    				  var user 			= "";
	    					  
	    				  if( !guest ) {
	    					  user = self.user.data().name;
	    				  }
	    				  
	    				  // push new comment into comment array
	    				  data.unshift({
		    				  name 		: user,
		    				  guest		: guest,
		    				  date		: (new Date()).toJSON(),
		    				  text		: text,
		    				  replies 	: []
		    			  });
		    			  
		    			  // calculate comment count
	    				  var comments 	= dataset.data.comments;
		    			  var count 	= comments.length;
		    			  
		    			  for( var i=0; i < comments.length; i++ ) {
		    				  count += comments[i].replies.length;
		    			  }
		    			  
		    			  dataset.data.count = count;
		    			  
		    			  // set and rerender
		    			  self.store.set( dataset, function() {
		    				  self.render();
		    			  });
	    			  });
	    		  } else {
	    			  // otherwise login and try again
	    			  self.user.login(function() {
	    				  post(text, guest)
	    			  });
	    		  }
	    	  }
	    	  
	    	  function isLoggedIn() {
	    		  return (self.user.data() !== null);
	    	  };
	    	  
	    	  // --------------------------------------------------------------------
	    	  // UTILS
	    	  
	    	  // Konvertiert ein ISO Datum zu einem regulären DAtum
	    	  function convertISODateToDate(isodate) {
	    		  return new Date(isodate);
	    	  };
	    	  
	    	  // html selektoren
	    	  
	    	  function first(element, selector) {
	    		  return find(element, selector).first();
	    	  };
	    	  
	    	  function find(element, selector) {
	    		  return $(element).find(selector);
	    	  };
	    	  
	    	  // --------------------------------------------------------------
	    	  // html operationen
	    	  
	    	  function set(element, template, data) {
	    		  return _add(element, "html", template, data);
	    	  };
	    	  
	    	  function append(element, template, data) {
	    		  return _add(element, "append", template, data);
	    	  };
	    	  
	    	  function prepend(element, template, data, fnCallback) {
	    		  return _add(element, "prepend", template, data);
	    	  };
	    	  
	    	  function insertAfter(element, template, data) {
	    		  return _add(element, "after", template, data);
	    	  };
	    	  
	    	  function insertBefore(element, template, data) {
	    		  return _add(element, "before", template, data);
	    	  };
	    	  
	    	  function _add(element, operation, template, data) {
	    		  var html = ccm.helper.html(template, data)
	    		  $(element)[operation](html);
	    		  
	    		  return html;
	    	  };
	      });
	};
  }
  
  /* ------------------------------------------------ type definitions ------------------------------------------------*/

  /**
   * @namespace ccm.components.comment
   */

  /**
   * @summary <i>ccm</i> instance configuration
   * @typedef {ccm.config} ccm.components.blank.config
   * @property {string} classes - css classes for own website area
   * @property {ccm.element} element - own website area
   * @property {Object.<ccm.key, ccm.html>} html - <i>ccm</i> html data templates for own content
   * @property {ccm.key} key - key of [blank dataset]{@link ccm.components.blank.dataset} for rendering
   * @property {ccm.store} store - <i>ccm</i> datastore that contains the [blank dataset]{@link ccm.components.blank.dataset} for rendering
   * @property {ccm.style} style - css for own content
   * ...
   */

  /**
   * @summary blank dataset for rendering
   * @typedef {ccm.dataset} ccm.components.blank.dataset
   * @property {ccm.key} key - dataset key
   * ...
   */

} );