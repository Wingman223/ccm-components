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
    	
    	// set localization to de
    	self.i18n = self.i18n.de
    	
    	// init datastore
	    /*self.store.del( self.key, function() {
	    	
	    	console.log("data deleted");
	    	*/
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
	    //});
	    
	    // when done call callback
	    function proceed( dataset ) {
	    	
	    	// listen to change event of ccm realtime datastore => update own content
	        self.store.onChange = function () {
	        	self.render();
	        };
	    	
	    	console.log("initialized!");
	    	console.log(dataset);
	    	
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
	    		  return insertAfter(element, getTemplate("postbox"), {
	    			  // i18n
	    			  POSTBOX_INSERTCOMMENT			: i18n.POSTBOX_INSERTCOMMENT,
	    			  POSTBOX_SEND					: i18n.POSTBOX_SEND,
	    			  POSTBOX_USER_GUEST			: i18n.POSTBOX_USER_GUEST,
	    			  // events
	    			  onPostboxTextareaClick 		: function() {
	    				  console.log("click");
	    			  },
	    			  onPostboxTextareaFocusout 	: function() {
	    				  console.log("focusout");
	    			  },
	    			  onPostboxButtonSubmitClick	: function() {
	    				  console.log("submit");
	    			  }
	    		  });
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
	    			  onCommentButtonReplyClick	: function() {
	    				  console.log("reply");
	    			  }
		    	  };
	    		  
	    		  return append(element, getTemplate("comment"), data);
	    	  };
	    	  
	    	  
	    	  /*
	    	  function insertPostbox(element, index) {
	    		  
	    		  // first append postbox
	    		  var postbox = insertHTML(element, 1, getTemplate("postbox"), data);
	    		  
	    		  // then register events
	    		  // textarea input
	    		  var textarea = postbox.children(".textarea").eq(0);
	    		  textarea.on("click"		, onPostboxClick);
	    		  textarea.on("focusout"	, onPostboxFocusOut);
	    		  
	    		  // submit
	    		  var submitsection		= postbox.children("section").eq(0).children()
	    		  var checkbox			= submitsection.eq(1).children().eq(0).children("input").eq(0);
	    		  var submitbutton		= submitsection.eq(0).children().eq(0);
	    		  
	    		  submitbutton.on("click", function(event) {
	    			  onPostboxSubmit(event, textarea, checkbox);
	    		  });
	    		  
	    		  return postbox;
	    	  };
	    	  
	    	  function appendComment(element, comment) {
	    		  
	    		  // get and convert data to appropriate format
	    		  var date		= convertISODateToDate(comment.date);
	    		  var data 		= {
	    			  name : comment.name,
		    		  date : convertDateForOutput(date),
		    		  text : comment.text
		    	  };
	    		  
	    		  return appendHTML(element, getTemplate("comment"), data);
	    	  };
	    	  */
	    	  
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
	    		  
	    		  if( years > 0 ) {
	    			  return "vor " + years + " " + ( years > 1 ? "Jahre" : "Jahr" );
	    		  }
	    		  else if ( months > 0 ) {
	    			  return "vor " + months + " " + ( months > 1 ? "Monate" : "Monat"); 
	    		  }
	    		  else if ( days > 0 ) {
	    			  return "vor " + days + " " + ( days > 1 ? "Tagen" : "Tag"); 
	    		  }
	    		  else if ( hours > 0 ) {
	    			  return "vor " + hours + " " + ( hours > 1 ? "Stunden" : "Stunde");
	    		  }
	    		  else if ( minutes > 2 ) {
	    			  return "vor " + minutes + " Minuten";
	    		  }
	    		  else {
	    			  return "Gerade eben";
	    		  }
	    	  };
	    	  
	    	  // get html template from json data
	    	  function getTemplate(name) {
	    		  return self.html.component[name];
	    	  };
	    	  
	    	  // --------------------------------------------------------------------
	    	  // BUSINESS LOGIC
	    	  
	    	  function onPostboxClick() {
	    		  $(this).toggleClass("inputerror"	, false);
	    		  
	    		  // get text and make sure it's not compromised
	    		  $(this).text(function(index, text) {
	    			  var text_cleaned = ccm.helper.val(text);
	    			  
	    			  if( typeof text_cleaned === "string" && text_cleaned.length > 0 ) {
	    				  if( text_cleaned === "Kommentar hier eintippen (mindestens 3 Zeichen)" ) {
	    					  $(this).toggleClass("placeholder"	, false);
	    					  return "";
	    				  }
	    			  }
	    		  });
	    	  };
	    	  
	    	  function onPostboxFocusOut() {
	    		  $(this).toggleClass("inputerror"	, false);
	    		  
	    		  // set text when user didn't input any text
	    		  $(this).text(function(index, text) {
	    			  var text_cleaned = ccm.helper.val(text);
	    			  
	    			  if( typeof text_cleaned === "string" && text_cleaned.length === 0 ) {
	    				  $(this).toggleClass("placeholder"	, true);
	    				  return "Kommentar hier eintippen (mindestens 3 Zeichen)";
	    			  }
	    		  });
	    	  };
	    	  
	    	  function onPostboxSubmit(event, textarea, checkbox) {
	    		  
	    		  textarea.text(function(index, text) {
	    			  var text_cleaned 	= ccm.helper.val(text);
	    			  var anonymous		= checkbox.prop("checked");
	    			  
	    			  if( typeof text_cleaned === "string" && text_cleaned.length > 2 ) {
	    				  if( text_cleaned !== "Kommentar hier eintippen (mindestens 3 Zeichen)" ) {
	    					  post(text_cleaned, anonymous);
	    					  textarea.toggleClass("inputerror", false);
	    				  } else {
	    					  textarea.toggleClass("inputerror", true);
	    				  }
	    			  } else {
	    				  textarea.toggleClass("inputerror", true);
	    			  }
	    		  });
	    	  };
	    	  
	    	  function post(text, anonymous) {
	    		  self.store.get( self.key, function(dataset) {
	    			 
	    			  var data 	= dataset.data;
	    			  var user;
	    			  
	    			  if( anonymous ) {
	    				  user	= "Anonym";
	    			  } else {
	    				  user	= "Angemeldeter Benutzer";
	    			  }
	    			  
	    			  data.comments.push({
	    				  name 		: user,
	    				  date		: (new Date()).toJSON(),
	    				  text		: text,
	    				  replies 	: []
	    			  });
	    			  
	    			  
	    			  var count = data.comments.length;
	    			  for( var i=0; i<data.comments.length; i++ ) {
	    				  count += data.comments[i].replies.length;
	    			  }
	    			  
	    			  dataset.data.count = count;
	    			  
	    			  self.store.set( dataset, function() {
	    				  self.render();
	    			  });
	    		  });
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
	    		  return $(element).children(selector);
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