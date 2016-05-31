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
    //store	: [ ccm.store	, './json/comment.json' ],
    store	: [ ccm.store	, { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'comment' }],
    mock	: [ ccm.load	, './json/comment.json' ],
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
    	
    	// ...
    	
    	callback();
    };

    /**
     * @summary when <i>ccm</i> instance is ready
     * @description
     * Called one-time when this <i>ccm</i> instance and dependent <i>ccm</i> components, instances and datastores are initialized and ready.
     * This method will be removed by <i>ccm</i> after the one-time call.
     * @param {function} callback - callback when this instance is ready
     */
    self.ready = function ( callback ) {

		// init datastore
    	/*
	    self.store.del( self.key, function() {
	    	
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
	    function proceed( dataset2 ) {
	    	
	    	console.log("initialized!");
	    	console.log(dataset2);
	    	
	    	callback();
	    }
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
	    	  // Get the main structure and set pointers to the important layout parts
	    	  var layout 			= self.html.main;
	    	  var layout_main		= layout[0].inner;
	    	  var layout_comments	= layout_main[1].inner
	    		  
	    	  // the postbox is used in multiple places. So instead of writing it directly
	    	  // into the layout we insert it dynamically on request
	    	  // there is the hardcoded one on top and a dynamic one on reply request below
	    	  // the comment. 
	    	  // There is a placeholder at the 2nd index. We replace it with the real component
	    	  // replaceAggregation(layout_main, 1, components["postbox"]);
	    	  
	    	  // render dom so that we gain access to the html elements
	    	  var layout_div = ccm.helper.element( self );
	    	  layout_div.html( ccm.helper.html( self.html.main, { 
	    		  number : data.count
	    	  }));
	    	  
	    	  // postbox can be inserted at a static place in the main layout
	    	  var main_div	= layout_div.children().eq(0);
	    	  insertPostbox(main_div, 0);
	    	  
	    	  // now insert comments
	    	  var comments_div 	= main_div.find(".comments").first();
	    	  for( var i=0; i < data.comments.length; i++ ) {
	    		  // append comment to the element
	    		  var comment 		= data.comments[i];
	    		  var comment_div 	= appendComment(comments_div, comment);
	    		  
	    		  // check if there are replies. If yes attach them, too
	    		  if( comment.replies && comment.replies.length > 0 ) {
	    			  var followup_div	= comment_div.children(".followup").first();
	    			  var replies 		= comment.replies;
	    			  
	    			  for( var j=0; j<replies.length; j++ ) {
	    				  var reply 	= replies[j];
	    	    		  appendComment(followup_div, reply);
	    			  }
	    		  }
	    	  }
	    	  
	    	  // perform callback
	    	  if ( callback ) callback();
	    	  
	    	  // ---------------------------------------------------------------------------
	    	  // PRIVATE
	    	  
	    	  // TODO REFACTOR! USE CCM-EVENTS WHEN POSSIBLE
	    	  function insertPostbox(element, index) {
	    		  
	    		  // first append postbox
	    		  var postbox 	= insertHTML(element, 1, getTemplate("postbox"), data);
	    		  
	    		  // then register events
	    		  // textarea input
	    		  var textarea 		= postbox.children(".textarea").eq(0);
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
	    	  
	    	  // calculcates the time difference between the given and current date
	    	  // outputs a string with an appropriate number between
	    	  //
	    	  // Used tutorial : http://stackoverflow.com/questions/17732897/difference-between-two-dates-in-years-months-days-in-javascript
	    	  // from Rajeev P Nadig
	    	  function convertDateForOutput(date) {
	    		  var curr		= new Date();
	    		  var diff		= new Date(curr - date);
	    		  
	    		  var minutes	= diff.getMinutes();
	    		  var hours		= diff.getHours();
	    		  var days		= diff.getDate();
	    		  var months	= diff.getMonth();
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
	    	  }
	    	  
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
	    	  
	    	  // TODO CHECK MODIFY DATE
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
	    	  
	    	  // compile and append the given html template to the dom element
	    	  function appendHTML(element, template, data) {
	    		  var appended = ccm.helper.html(template, data)
	    		  element.append(appended);
	    		  
	    		  return appended;
	    	  };
	    	  
	    	  // compile and insert the given html template at the provided index
	    	  // jQuery doesn't support insert at index out of the box, so i used a tutorial here
	    	  // url	: http://stackoverflow.com/questions/3562493/jquery-insert-div-as-certain-index
	    	  // autor 	: Didier Ghys
	    	  function insertHTML(element, index, template, data) {	  
	    		  var lastIndex = element.children().size()
	    		  if (index < 0) {
	    		    index = Math.max(0, lastIndex + 1 + index)
	    		  }
	    		  var appendedElement = appendHTML(element, template, data);
	    		  if (index < lastIndex) {
	    			  element.children().eq(index).before(element.children().last())
	    		  }
	    		  return appendedElement;
	    	  }
	    	  
	    	  // replace an object in an array with a new one
	    	  function replaceAggregation(array, index, component) {
	    		  array[index] = copyObject(component);
	    	  };
	    	  
	    	  // insert a object at index
	    	  function insertAggregation(array, index, component) {
	    		  array.splice(index, 0, copyObject(component));
	    	  };
	    	  
	    	  // remove an object at index
	    	  function removeAggregation(array, index) {
	    		  array.splice(index, 1);
	    	  };
	    	  
	    	  // Copy object with JSON.parse and JSON.stringify
	    	  // This is an easy solution and due to the small size of the object no real performance
	    	  // bottleneck. We coul'd use jQuery.extend or eval() here but jQuery.extend has issues
	    	  // with copying the whole object and eval() is too dangerous to use. Not worth the effort
	    	  function copyObject(o) {
	    		  return JSON.parse(JSON.stringify(o));
	    	  }
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