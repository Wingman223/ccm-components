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
    i18n	: [ ccm.load	, './json/i18n.json' ],
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
    	self.i18n 		= self.i18n[userlang];
    	
    	//self.i18n = self.i18n.en;
    	
    	// init datastore
	    self.store.del( self.key, function() {
	    	
	    	console.log("data deleted");
	    	
	    	self.store.get( self.key, function(dataset) {
	    		
	    		console.log("got data");
	    		console.log(dataset);
	    		
	    		if( dataset === null ) {
	    			
	    			var mockdata = { key : self.key, data : self.mock };
	    			
	    			console.log("setting new data");
	    			console.log(mockdata);
	    			
	    			self.store.set(mockdata, proceed);
	    		} else {
	    			console.log("data ok");
	    			proceed(dataset);
	    		}
	    	});
	    });
	    
	    // when done call callback
	    function proceed( dataset ) {
	    	
	    	// ...
	    	
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
	    	  var data 				= dataset.data;
	    	  // Dynamic components we use for insertion
	    	  var components		= self.html.component;
	    	  // i18n model
	    	  var i18n				= self.i18n;
	    	  
	    	  // ---------------------------------------------------
	    	  
	    	  // setup layout
	    	  var body 		= ccm.helper.element(self);
	    	  var section 	= set(body, self.html.main, {
	    		  number 				: data.count,
	    		  HEADER_NUM_COMMENTS	: i18n.HEADER_NUM_COMMENTS
	    	  });
	    	  
	    	  // add postbox directly after the header
	    	  var header	= first(section, "h1");
	    	  var postbox	= insertPostboxAfter(header);
	    	  
	    	  // now render comments
	    	  var comments	= first(section, ".comments");
	    	  for( var i=0; i < data.comments.length; i++ ) {
	    		  
	    		  // append comment to the element
	    		  var comment		= data.comments[i];
	    		  var comment_div	= appendComment(comments, comment);
	    		  
	    		  // check if there are replies. If yes attach them, too
	    		  if( comment.replies && comment.replies.length > 0 ) {
	    			  
	    			  // get followup data
	    			  var followup_div 	= first(comment_div, ".followup");
	    			  var replies		= comment.replies;
	    			  
	    			  // append replies
	    			  for( var j=0; j < replies.length; j++ ) {
	    				  var reply 	= replies[j];
	    	    		  appendComment(followup_div, reply);
	    			  }
	    		  }
	    	  }
	    	  
	    	  // perform callback
	    	  if ( callback ) callback();
	    	  
	    	  // ---------------------------------------------------------------------------
	    	  // PRIVATE
	    	  
	    	  function insertPostboxAfter(element) {
	    		  
	    		  var postbox = insertAfter(element, getTemplate("postbox"), {
	    			  // i18n
	    			  POSTBOX_INSERTCOMMENT			: i18n.POSTBOX_INSERTCOMMENT,
	    			  POSTBOX_SEND					: i18n.POSTBOX_SEND,
	    			  POSTBOX_USER_GUEST			: i18n.POSTBOX_USER_GUEST,
	    			  // events
	    			  onPostboxTextareaClick 		: onPostboxTextareaStateChange,
	    			  onPostboxButtonSubmitClick	: function() {
	    				  onPostboxButtonSubmitClick(postbox);
	    			  }
	    		  });
	    		  
	    		  // textarea
	    		  var textarea 		= first(postbox, ".textarea");
	    		  $(textarea).on("focusout"	, onPostboxTextareaStateChange);
	    		  
	    		  return postbox;
	    	  };
	    	  
	    	  function appendComment(element, comment) {
	    		  
	    		  var date		= convertISODateToDate(comment.date);
	    		  var data 		= {
	    			  // localization
	    			  COMMENT_BUTTON_REPLY		: i18n.COMMENT_BUTTON_REPLY,
	    			  // data
	    			  name 						: comment.name,
	    			  date 						: convertDateForOutput(date),
	    			  text 						: comment.text,
	    			  // events
	    			  onCommentButtonReplyClick	: onPostboxButtonSubmitClick
		    	  };
	    		  
	    		  return append(element, getTemplate("comment"), data);
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
	    	  
	    	  function onPostboxButtonSubmitClick(postbox) {
	    		  
	    		  var textarea 	= first(postbox, ".textarea");
	    		  var checkbox	= first(postbox, ":checkbox");
	    		  
	    		  textarea.text(function(index, text) {
	    			  var text_cleaned 	= ccm.helper.val(text);
	    			  var guest			= (checkbox.prop("checked") == true);
	    			  
	    			  if( typeof text_cleaned === "string" && text_cleaned.length > 2 ) {
	    				  if( text_cleaned !== self.i18n.POSTBOX_INSERTCOMMENT ) {
	    					  post(text_cleaned, guest);
	    					  $(this).toggleClass("inputerror", false);
	    				  } else {
	    					  $(this).toggleClass("inputerror", true);
	    				  }
	    			  } else {
	    				  $(this).toggleClass("inputerror", true);
	    			  }
	    		  });
	    	  };
	    	  
	    	  function post(text, guest) {
	    		  
	    		  // post if guest or at least logged in
	    		  if( guest || isLoggedIn() ) {
	    			  
	    			  self.store.get(self.key, function(dataset) {
	    				  
	    				  var data = dataset.data;
	    				  var user = "";
	    					  
	    				  if( !guest ) {
	    					  user = self.user.data().name;
	    				  }
	    				  
	    				  // push new comment into comment array
	    				  data.comments.push({
		    				  name 		: user,
		    				  guest		: guest,
		    				  date		: (new Date()).toJSON(),
		    				  text		: text,
		    				  replies 	: []
		    			  });
		    			  
		    			  // calculate comment count
		    			  var count = data.comments.length;
		    			  for( var i=0; i<data.comments.length; i++ ) {
		    				  count += data.comments[i].replies.length;
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
  
  // ...

} );