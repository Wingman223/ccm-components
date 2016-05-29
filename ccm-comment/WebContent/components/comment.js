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
	    function proceed( dataset2 ) {
	    	
	    	console.log("initialized!");
	    	console.log(dataset2);
	    	
	    	callback();
	    }
	    
	    // perform callback
	    callback();
    };

    /**
     * @summary render content in own website area
     * @param {function} [callback] - callback when content is rendered
     */
    self.render = function ( callback ) {
    	
	      var element = ccm.helper.element( self );
	      
	      console.log(self);
	      
	      ccm.helper.dataset( self, function( dataset ) {
	    	  
	    	  var data = dataset.data;
	    	  
	    	  // render main html structure
	    	  element.html( ccm.helper.html( self.html.main, { number : data.count } ));
	    	  
	    	  console.log(self.html.i18n);
	    	  console.log(self.html.component);
	    	  
	    	  // perform callback
	    	  if ( callback ) callback();
	    	  
	      });
	};
  }

  /*------------------------------------------------ type definitions ------------------------------------------------*/

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