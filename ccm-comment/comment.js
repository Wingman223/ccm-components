/**
 * @overview Comment component written for the <i>ccm</i> framework during master course web engineering 2016
 * at Bonn-Rhein-Sieg University. Also see {@link http://akless.github.io/ccm-developer/api/ccm/index.html}
 * for a detailed documentation about the <i>ccm</i> framework.
 * 
 * Offers the possibility to add and reply to comments. Can be embedded in any site to be used alongside other
 * components (approach to componentize the web).
 * 
 * @author 		Patrick Reif <patrick.reif@inf.h-brs.de>
 * @copyright 	Copyright (c) 2016 Bonn-Rhein-Sieg University of Applied Sciences
 * @license 	The MIT License (MIT)
 */

ccm.component( {

  /*-------------------------------------------- public component members --------------------------------------------*/

  /**
   * @summary name of the component
   * @memberOf ccm.components.ccm_comment
   * @type {ccm.name}
   */
  name: 'comment',

  /**
   * @summary default instance configuration
   * @memberOf ccm.components.ccm_comment
   * @type {ccm.components.ccm_comment.config}
   */
  config: {
	key		: 'comment'		,
    html	: [ ccm.load	, 'comment_html.json' ],
    mock	: [ ccm.load	, 'comment_mock.json' ],
    i18n	: [ ccm.load	, 'comment_i18n.json' ],
    style	: [ ccm.load	, 'comment.css' ],
    store	: [ ccm.store	, { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'comment' }],
    user	: [ ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js' ]
  },

  /*-------------------------------------------- public component classes --------------------------------------------*/

  /**
   * @summary constructor for creating an instance of ccm comment
   * @alias ccm.components.ccm_comment
   * @class
   */
  Instance: function () {
	  
	  
	  // --------------------------------------------------------------
	  // model context
	  
	  /**
	   * @summary constructor for creating <i>ccm</i> instances out of this component
	   * @alias ccm.components.ccm_comment.Context
	   * @class
	   * 
	   * @param {Object} model - datastructure
	   * @param {string} path - path that points to an element inside the datastructure
	   * @param {Object} [context] - Use path of another context to combine with provided path
	   * 
	   * @example
	   * A datastructure is represented as js object. To point to a element inside of it you have to
	   * provide a path parameter. As an example the following model is provided
	   * 
	   * var model = {
	   * 	hello : [
	   * 		{
	   * 			world : "World!"
	   * 		}
	   * 	]
	   * }
	   * 
	   * To get the object that contains world, you write in js
	   * 
	   * model.hello[0].world
	   * 
	   * this can also be represented as a path using the following notation
	   * 
	   * /hello/0/world
	   */
	  function Context(model, path, context) {
		  
		  // make sure path is of type string
		  if( typeof path !== "string" ) {
			  path = path + "";
		  }
		  
		  // check if context was provided
		  if( context ) {
			  
			  if( !context.getPath ) {
				  console.log(context);
				  throw new Error("Context provided but without getPath?");
			  }
			  
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
	  
	  /**
	   * Getter for context model
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * @returns {Object}
	   */
	  Context.prototype.getModel = function() {
		  return this.model;
	  };
	  
	  /**
	   * Getter for path
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * @returns {string}
	   */
	  Context.prototype.getPath = function() {
		  return this.path;
	  };
	  
	  /**
	   * Returns all data available at the provided path
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * 
	   * @returns {*}
	   */
	  Context.prototype.getData = function() {
		  return this._traverse(this.getPath());
	  };
	  
	  /**
	   * Returns all data available at the combined path
	   * and property information.
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * 
	   * @param {string} property - name of property or subpath
	   * @returns {*}
	   */
	  Context.prototype.getProperty = function(property) {
		  return this._traverse(this.getPath() + "/" + property);
	  };
	  
	  /**
	   * Traverses along the path through the model to retrieve the
	   * data requested.
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * @private
	   * 
	   * @param {string} path - path 
	   * @returns {*}
	   */
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
	  
	  /**
	   * Removes leading slash from path string
	   * 
	   * @memberOf ccm.components.ccm_comment.Context
	   * @private
	   * 
	   * @param {string} path - path 
	   * @returns {string} path without leading slash
	   */
	  Context.prototype._removeLeadingSlash = function(path) {
		  // if there is a slash at index 0 (first character in string) remove it
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
    
    /**
     * @summary current localization (countryCode)
     * @private
     */
    var currLocalization;
    
    
    /**
     * Called on localization change. Updates the localization of the component
     * and triggers a rerender.
     * @private
     * 
     * @param {Object} event
     */
    function onLocalizationSelectionChanged(event) {
    	var countryCode = event.target.value;
    	setLocalization(countryCode);
    	
    	self.render();
    };
    
    /**
     * Sets a new localization from localization model
     * 
     * @param {string} countryCode - Language encoded as countryCode
     */
    function setLocalization(countryCode) {
    	
    	// FIXME workaround to be able to switch between localizations.
    	// Save a reference to the full localization in self.i18nSave
    	if(!self.i18nSave) {
    		self.i18nSave = self.i18n;
    	}
    	
    	// set and save for rerender
    	self.i18n 			= self.i18nSave[countryCode];
    	currLocalization 	= countryCode;
    };
    
    /**
     * Retrieves the language from browser and converts it into an
     * internal country code.
     * 
     * @example
     * Country codes available in this component
     * 
     * deDE = German - Germany
     * enEN = English - Great Britain
     * 
     * @returns {string} Language represented as countryCode
     */
    function getBrowserLanguage() {
    	
    	var sLang = (navigator.language || navigator.userLanguage);
    	
    	// check if the returned browser language is valid
    	if( typeof sLang === "string" && sLang.length > 0 ) {
    		// convert to lower case and check if it contains "en"
    		sLang = sLang.toLowerCase();
    		return sLang.indexOf("en") === -1 ? "deDE" : "enEN";
    	} else {
    		// not valid so fall back to deDE
    		console.warn("Could not retrieve browser language. Falling back to deDE");
    		return "deDE";
    	}
    };
    
    /*------------------------------------------- public instance methods --------------------------------------------*/

    /**
     * @summary initializes a new ccm_comment instance
     * @description
     * Called one-time when this <i>ccm_comment</i> instance is created, all dependencies are solved and before dependent <i>ccm</i> components, instances and datastores are initialized.
     * This method will be removed by <i>ccm</i> after the one-time call.
     * @param {function} callback - callback when this instance is ready
     * @memberOf ccm.components.ccm_comment
     */
    self.init = function ( callback ) {
    	
    	// set localization if not set already
    	if(!currLocalization) {
    		var countryCode	= getBrowserLanguage();
        	setLocalization(countryCode);
    	}
    	
    	// init datastore
    	// due to changes in the datastore logic in ccm 6.3.0, calling get and set no longer
    	// works during init. Moved to "initDatastore" and is now called on the first render
    	// operation ( which may cause delay )
    	/*
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
	    */
    	
    	callback();
    };
    
    /**
     * @summary when <i>ccm</i> instance is ready
     * @description
     * Called one-time when this <i>ccm</i> instance and dependent <i>ccm</i> components, instances and datastores are initialized and ready.
     * This method will be removed by <i>ccm</i> after the one-time call.
     * @param {function} callback - callback when this instance is ready
     * @memberOf ccm.components.ccm_comment
     */
    self.ready = function ( callback ) {
    	
    	//...
    	
	    callback();
    };
    
    /**
     * @summary populates the data storage
     * @description
     * Populates the data storage with mockdata if there is no data available. Added for demo purposes.
     * Was moved to own function as fix for ccm 6.3.0 and above.
     * @memberOf ccm.components.ccm_comment
     */
    self.initDatastore = function() {
    	
    	if( !self.bStoreInitialized ) {
    		
	    	//self.store.del( self.key, function() {
		    	self.store.get( self.key, function(dataset) {
		    		
		    		if( dataset === null ) {
		    			var mockdata = { key : self.key, data : self.mock };
		    			self.store.set(mockdata/*, proceed*/);
		    		}
		    		
		    		self.bStoreInitialized = true;
		    	});
		    //});
    	}
    };

    /**
     * @summary render content in own website area
     * @param {function} [callback] - callback when content is rendered
     * @memberOf ccm.components.ccm_comment
     */
    self.render = function ( callback ) {
    	
    	self.initDatastore();
    	
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
	    		  number 							: model.data.count,
	    		  HEADER_NUM_COMMENTS				: i18n.HEADER_NUM_COMMENTS,
	    		  onLocalizationSelectionChanged	: function(event) {
	    			  onLocalizationSelectionChanged(event);
	    		  }
	    	  });
	    	  
	    	  var header			= first(section, "div");
	    	  
	    	  // for demo. Preselect localization from browser
	    	  var select			= first(header, "select");
	    	  $(select).children("option[value=" + currLocalization + "]").attr('selected', 'selected');
	    	  
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
	    	  
	    	  /**
	    	   * Inserts the html template for a "postbox" element after the provided
	    	   * element. Also binds a data context to the postbox for later usage.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {ccm.components.ccm_comment.Context} context - Data context pointing to comments
	    	   */
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
	    	  
	    	  /**
	    	   * Appends the html template for a comment element after the provided
	    	   * element. Also binds two context objects to the comment element for later usage.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {ccm.components.ccm_comment.Context} context - Context element pointing to the comment
	    	   * @param {ccm.components.ccm_comment.Context} postbox_context - Context element pointing to replies for this comment
	    	   */
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
	    	  
	    	  /**
	    	   * Calculcates the time difference between the given and current date.
	    	   * Used tutorial :{@link http://stackoverflow.com/questions/17732897/difference-between-two-dates-in-years-months-days-in-javascript}
	    	   * from "Rajeev P Nadig"
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} date
	    	   * @returns {string} - Time difference as localized string in form "10 minutes ago"
	    	   * 
	    	   */
	    	  function convertDateForOutput(date) {
	    		  
	    		  var curr		= new Date();
	    		  var diff		= new Date(curr - date);
	    		  
	    		  var minutes	= diff.getMinutes();
	    		  var hours		= diff.getHours() - 1;
	    		  var days		= diff.getDate() - 1;
	    		  var months	= diff.getMonth();
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
	    			  text += minutes + " " + i18n.COMMENT_DATE_MINUTES;
	    		  }
	    		  else {
	    			  return i18n.COMMENT_DATE_NOW;
	    		  }
	    		  
	    		  text += " " + i18n.COMMENT_DATE_SUFFIX;
	    		  
	    		  return text;
	    	  };
	    	  
	    	  // get html template from json data
	    	  
	    	  /**
	    	   * Component template used for html element generation
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {string} name - Name of the component template
	    	   * @returns {Object} - Template
	    	   */
	    	  function getTemplate(name) {
	    		  return self.html.component[name];
	    	  };
	    	  
	    	  // --------------------------------------------------------------------
	    	  // BUSINESS LOGIC
	    	  
	    	  /**
	    	   * @summary Change handler for postbox
	    	   * @description
	    	   * Toggles placeholder dependent on the event type. If user clicks into the html element placeholder
	    	   * is replaced by empty string. If element looses his focus the placeholder is added again if there is
	    	   * not text in it.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   * 
	    	   * @param {Object} event - Event of postbox element
	    	   */
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
	    	  
	    	  /**
	    	   * @summary pointer to temporarily added postbox element
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   */
	    	  var temp_postbox = null;
	    	  
	    	  /**
	    	   * @summary Change handler for comment reply
	    	   * @description
	    	   * Inserts a new postbox after the comment to allow for direct input of comment without the need to
	    	   * scroll up. If a postbox is already open, it gets closed automatically.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   * 
	    	   * @param {Object} event - Event of postbox element
	    	   * @param {Object} element - jQuery html element
	    	   * @param {ccm.components.ccm_comment.Context} context - Context element pointing to replies for this comment
	    	   */
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
	    	  
	    	  /**
	    	   * @summary Click handler for comment close button
	    	   * @description
	    	   * Closes the temporary postbox added for a reply action
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   * 
	    	   * @param {Object} event - Event of postbox element
	    	   * @param {Object} element - jQuery html element
	    	   * @param {ccm.components.ccm_comment.Context} context - Context element pointing to replies for this comment
	    	   */
	    	  function onCommentButtonCloseClick(event, element, context) {
	    		  closePostbox();
	    	  };
	    	  
	    	  /**
	    	   * Removes the temporarily added postbox
	    	   * @memberOf ccm.components.ccm_comment
	    	   */
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
	    	  
	    	  /**
	    	   * @summary Click handler for postbox submit action
	    	   * @description
	    	   * On submit validates the postbox contents. If it's contents are valid triggers a submit. Otherwise
	    	   * informs the user about the invalid input.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   * 
	    	   * @param {Object} event - Event of postbox element
	    	   * @param {Object} element - jQuery html element
	    	   * @param {ccm.components.ccm_comment.Context} context - Context element pointing to the location where a comment has to be added
	    	   */
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
	    	  
	    	  /**
	    	   * Saves a comment at the provided location in the data storage. If requested a user
	    	   * can also post with his registered account.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * @private
	    	   * 
	    	   * @param {ccm.components.ccm_comment.Context} context - Context element pointing to the location where a comment has to be added
	    	   * @param {string} text - Comment text to add
	    	   * @param {boolean} guest - Post comment anonymous
	    	   */
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
	    				  post(context, text, guest)
	    			  });
	    		  }
	    	  }
	    	  
	    	  /**
	    	   * Checks if a user is logged in
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @returns {boolean}
	    	   */
	    	  function isLoggedIn() {
	    		  return (self.user.data() !== null);
	    	  };
	    	  
	    	  // --------------------------------------------------------------------
	    	  // UTILS
	    	  
	    	  // Konvertiert ein ISO Datum zu einem regulären DAtum
	    	  /**
	    	   * Converts a iso date into a js date
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Number} isodate - Date in ISO notation
	    	   * @returns {Object} - js date
	    	   */
	    	  function convertISODateToDate(isodate) {
	    		  return new Date(isodate);
	    	  };
	    	  
	    	  // html selektoren
	    	  
	    	  /**
	    	   * Wrapper for jquery find and selecting the first element
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {string} selector - Selector string matching html element properties
	    	   * 
	    	   * @returns {Object} - jQuery html element
	    	   */
	    	  function first(element, selector) {
	    		  return find(element, selector).first();
	    	  };
	    	  
	    	  /**
	    	   * Wrapper for jquery element find
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {string} selector - Selector string matching html element properties
	    	   * 
	    	   * @returns {array} - Array of jQuery html elements
	    	   */
	    	  function find(element, selector) {
	    		  return $(element).find(selector);
	    	  };
	    	  
	    	  // --------------------------------------------------------------
	    	  // html operationen
	    	  
	    	  /**
	    	   * Replaces the current html element with the newly created one
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {Object} template - Template of the html element
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
	    	  function set(element, template, data) {
	    		  return _add(element, "html", template, data);
	    	  };
	    	  
	    	  /**
	    	   * Creates and appends the html element
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {Object} template - Template of the html element
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
	    	  function append(element, template, data) {
	    		  return _add(element, "append", template, data);
	    	  };
	    	  
	    	  /**
	    	   * Creates and prepends the html element
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {Object} template - Template of the html element
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
	    	  function prepend(element, template, data, fnCallback) {
	    		  return _add(element, "prepend", template, data);
	    	  };
	    	  
	    	  /**
	    	   * Creates and insert the html element after the one provided
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {Object} template - Template of the html element
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
	    	  function insertAfter(element, template, data) {
	    		  return _add(element, "after", template, data);
	    	  };
	    	  
	    	  /**
	    	   * Creates and insert the html element before the one provided
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {Object} template - Template of the html element
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
	    	  function insertBefore(element, template, data) {
	    		  return _add(element, "before", template, data);
	    	  };
	    	  
	    	  /**
	    	   * Creates a new html element and inserts it after an
	    	   * existing.
	    	   * @memberOf ccm.components.ccm_comment
	    	   * 
	    	   * @param {Object} element - jQuery html element
	    	   * @param {string} operation - jQuery operation to execute on element
	    	   * @param {Object} template - Template to generate with ccm.helper.html
	    	   * @param {string} data - Data to bind to template
	    	   * 
	    	   * @returns {Object} html - jQuery html element
	    	   */
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
   * @namespace ccm.components.ccm_comment
   */

  /**
   * @summary <i>ccm</i> instance configuration
   * 
   * @typedef {ccm.config} ccm.components.ccm_comment.config
   * @property {string} key - Key used for ccm.store initialization
   * @property {Object} html - <i>ccm</i> html data templates for own content
   * @property {Object} mock - Mockdata used for ccm.store initialization
   * @property {Object} i18n - Localization 
   * @property {ccm.style} style - css classes used in ccm_comment
   * @property {ccm.store} store - datastore that contains all comments for display
   * @property {ccm.instance} user - userstore for retrieval of user related data
   */

} );